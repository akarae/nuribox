const companyModel = require("../models/companyModel");
const bcrypt = require("bcrypt");
const logger = require("../config/logger");

const getCompanies = async (req, res) => {
  try {
    res.json(await companyModel.findAll());
  } catch (err) {
    logger.error(`getCompanies error: ${err.message}`);
    res.status(500).json({ message: "업체 목록 조회 실패" });
  }
};

const createCompany = async (req, res) => {
  try {
    await companyModel.create(req.body);
    res.status(201).json({ message: "업체가 등록되었습니다." });
  } catch (err) {
    logger.error(`createCompany error: ${err.message}`);
    res.status(500).json({ message: "업체 등록 실패" });
  }
};

const updateCompany = async (req, res) => {
  try {
    await companyModel.update(req.params.companyId, req.body);
    res.json({ message: "업체 정보가 수정되었습니다." });
  } catch (err) {
    logger.error(`updateCompany error: ${err.message}`);
    res.status(500).json({ message: "업체 수정 실패" });
  }
};

// 물리삭제 대신 status를 '삭제'로 변경하는 논리삭제 사용
const deleteCompany = async (req, res) => {
  try {
    await companyModel.update(req.params.companyId, { status: "삭제" });
    res.json({ message: "업체가 삭제 처리되었습니다." });
  } catch (err) {
    logger.error(`deleteCompany error: ${err.message}`);
    res.status(500).json({ message: "업체 삭제 실패" });
  }
};

// 업체별 대표 계정 발급 (role='company', 업체당 1개)
const createAccount = async (req, res) => {
  try {
    const { companyId, loginId, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await companyModel.createAccount({
      company_id: companyId,
      login_id: loginId,
      password: hashed,
      role: "company",
    });
    res.status(201).json({ message: "계정이 발급되었습니다." });
  } catch (err) {
    logger.error(`createAccount error: ${err.message}`);
    res.status(500).json({ message: "계정 발급 실패" });
  }
};

// 계정 존재 여부 확인 (비밀번호는 절대 내려주지 않음)
const getAccount = async (req, res) => {
  try {
    const account = await companyModel.findAccountByCompany(req.params.companyId);
    if (!account) return res.json({ exists: false });
    res.json({ exists: true, userId: account.user_id, loginId: account.login_id });
  } catch (err) {
    logger.error(`getAccount error: ${err.message}`);
    res.status(500).json({ message: "계정 조회 실패" });
  }
};

// 기존 계정 비밀번호만 재설정
const updateAccountPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await companyModel.updateAccount(req.params.userId, { password: hashed });
    res.json({ message: "비밀번호가 변경되었습니다." });
  } catch (err) {
    logger.error(`updateAccountPassword error: ${err.message}`);
    res.status(500).json({ message: "비밀번호 변경 실패" });
  }
};

const getMyCompany = async (req, res) => {
  try {
    const company = await companyModel.findById(req.user.companyId);
    res.json(company);
  } catch (err) {
    logger.error(`getMyCompany error: ${err.message}`);
    res.status(500).json({ message: "업체 정보 조회 실패" });
  }
};

module.exports = {
  getCompanies, createCompany, updateCompany, deleteCompany,
  createAccount, getAccount, updateAccountPassword, getMyCompany,
};