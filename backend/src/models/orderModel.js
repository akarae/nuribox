const { query } = require("../config/db");

// 식수정보 (tb_order) - 업체별 일자별 신청 수량. 연/월/주/요일은 menu_date로 산출.
const findByCompanyDateRange = (companyId, startDate, endDate) =>
  query(
    "SELECT * FROM tb_order WHERE company_id = ? AND menu_date BETWEEN ? AND ? ORDER BY menu_date",
    [companyId, startDate, endDate]
  );
const findAllByDateRange = (startDate, endDate) =>
  query("SELECT * FROM tb_order WHERE menu_date BETWEEN ? AND ? ORDER BY menu_date, company_id", [
    startDate,
    endDate,
  ]);
const upsert = (data) =>
  query(
    `INSERT INTO tb_order (company_id, menu_date, meal_type, order_count)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE order_count = VALUES(order_count)`,
    [data.companyId, data.menuDate, data.mealType, data.orderCount]
  );

// 통계관리 - 월별/일자별/요일별 집계 (menu_date로부터 산출)
const statsByMonth = (year, month) =>
  query(
    `SELECT
       company_id,
       menu_date,
       DAYOFWEEK(menu_date) AS weekday_num,
       meal_type,
       SUM(order_count) AS total
     FROM tb_order
     WHERE YEAR(menu_date) = ? AND MONTH(menu_date) = ?
     GROUP BY company_id, menu_date, meal_type`,
    [year, month]
  );

module.exports = { findByCompanyDateRange, findAllByDateRange, upsert, statsByMonth };
