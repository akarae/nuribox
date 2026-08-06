const { query } = require("../config/db");

// 공통코드 (tb_code) - WEEKDAY, MEAL_TYPE, BUSINESS_TYPE, COMPANY_STATUS 등
const findByGroup = (groupCode) =>
  query("SELECT * FROM tb_code WHERE group_code = ? ORDER BY sort_order", [groupCode]);

const create = (data) => query("INSERT INTO tb_code SET ?", [data]);

const update = (codeId, data) => query("UPDATE tb_code SET ? WHERE code_id = ?", [data, codeId]);

const remove = (codeId) => query("DELETE FROM tb_code WHERE code_id = ?", [codeId]);

const findAllGroups = () =>
  query("SELECT DISTINCT group_code FROM tb_code ORDER BY group_code");

module.exports = { findByGroup, create, update, remove, findAllGroups };
