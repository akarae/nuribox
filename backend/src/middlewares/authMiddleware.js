const jwt = require("jsonwebtoken");

// 로그인 여부 확인 (Access Token 검증)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "인증 토큰이 없습니다." });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // { companyCode, role, ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: "토큰이 유효하지 않거나 만료되었습니다." });
  }
};

// 관리자(누리도시락 운영자) 권한 확인
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "관리자 권한이 필요합니다." });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
