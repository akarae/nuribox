const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const companyModel = require("../models/companyModel");
const logger = require("../config/logger");

// 로그인 (admin / company 계정 공통, tb_user.role로 구분)
const login = async (req, res) => {
  try {
    const { companyCode, loginId, password } = req.body;
    let account;

    if (companyCode) {
      // URL에 업체코드가 실려온 경우 - 그 업체 소속 계정만 조회
      const company = await companyModel.findByCode(companyCode);
      if (!company) return res.status(401).json({ message: "유효하지 않은 접속 경로입니다." });
      account = await companyModel.findAccountByCompanyAndLoginId(company.company_id, loginId);
    } else {
      // 업체코드 없이 접속 = 관리자 로그인 페이지
      account = await companyModel.findAdminByLoginId(loginId);
    }

    if (!account) return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });

    const match = await bcrypt.compare(password, account.password);
    if (!match) return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });

    const payload = { userId: account.user_id, companyId: account.company_id, role: account.role };
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    logger.error(`login error: ${err.message}`);
    res.status(500).json({ message: "로그인 처리 중 오류가 발생했습니다." });
  }
};

// Access Token 재발급
const refresh = (req, res) => {
  const { refreshToken } = req.body;
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { userId: decoded.userId, companyId: decoded.companyId, role: decoded.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES }
    );
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: "Refresh Token이 유효하지 않습니다." });
  }
};

module.exports = { login, refresh };
