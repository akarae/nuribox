const { query } = require("../config/db");

// 식단정보 (tb_menu) - 전업체 동일 식단, 요일별 로우, 메뉴는 자유 text
const findByWeek = (year, month, week) =>
  query(
    "SELECT * FROM tb_menu WHERE menu_year = ? AND menu_month = ? AND menu_week = ? ORDER BY meal_type, menu_date",
    [year, month, week]
  );

const findByDateRange = (startDate, endDate, status) => {
  if (status) {
    return query(
      "SELECT * FROM tb_menu WHERE menu_date BETWEEN ? AND ? AND status = ? ORDER BY meal_type, menu_date",
      [startDate, endDate, status]
    );
  }
  return query(
    "SELECT * FROM tb_menu WHERE menu_date BETWEEN ? AND ? ORDER BY meal_type, menu_date",
    [startDate, endDate]
  );
};

const upsert = (data) =>
  query(
    `INSERT INTO tb_menu (menu_date, menu_year, menu_month, menu_week, weekday, meal_type, menu_text, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       menu_year = VALUES(menu_year),
       menu_month = VALUES(menu_month),
       menu_week = VALUES(menu_week),
       menu_text = VALUES(menu_text),
       weekday = VALUES(weekday),
       status = VALUES(status)`,
    [data.menuDate, data.year, data.month, data.week, data.weekday, data.mealType, data.menuText, data.status]
  );

const remove = (menuId) => query("DELETE FROM tb_menu WHERE menu_id = ?", [menuId]);

module.exports = { findByWeek, findByDateRange, upsert, remove };
