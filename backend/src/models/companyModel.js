const { query } = require("../config/db");

// 업체정보 (tb_company)
const findAll = () => query("SELECT * FROM tb_company ORDER BY company_id");

const findById = (companyId) =>
  query("SELECT * FROM tb_company WHERE company_id = ?", [companyId]).then((r) => r[0]);

const create = async (data) => {
  const tempCode = `TEMP-${Date.now()}`;
  const result = await query("INSERT INTO tb_company SET ?", [{ ...data, company_code: tempCode }]);
  const companyId = result.insertId;
  const companyCode = `C${String(companyId).padStart(4, "0")}`;
  await query("UPDATE tb_company SET company_code = ? WHERE company_id = ?", [companyCode, companyId]);
  return { companyId, companyCode };
};

const update = (companyId, data) =>
  query("UPDATE tb_company SET ? WHERE company_id = ?", [data, companyId]);
// 물리삭제 대신 status를 통한 논리삭제 권장 (예: update(companyId, { status: '삭제' }))
const remove = (companyId) => query("DELETE FROM tb_company WHERE company_id = ?", [companyId]);

const findAccountByCompany = (companyId) =>
  query("SELECT * FROM tb_user WHERE company_id = ?", [companyId]).then((r) => r[0]);

const createAccount = (data) => query("INSERT INTO tb_user SET ?", [data]);

const updateAccount = (userId, data) =>
  query("UPDATE tb_user SET ? WHERE user_id = ?", [data, userId]);

const findByCode = (companyCode) =>
  query("SELECT * FROM tb_company WHERE company_code = ?", [companyCode]).then((r) => r[0]);

const findAccountByCompanyAndLoginId = (companyId, loginId) =>
  query("SELECT * FROM tb_user WHERE company_id = ? AND login_id = ?", [companyId, loginId]).then((r) => r[0]);

const findAdminByLoginId = (loginId) =>
  query("SELECT * FROM tb_user WHERE role = 'admin' AND login_id = ?", [loginId]).then((r) => r[0]);

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findAccountByCompany,
  findByCode, 
  findAccountByCompanyAndLoginId, 
  findAdminByLoginId,
  createAccount,
  updateAccount,
};
