const { query } = require("../config/db");

const getStats = ({ year, month, companyId, mealType, groupBy }) => {
  const conditions = [];
  const params = [];

  if (year) { conditions.push("YEAR(o.menu_date) = ?"); params.push(year); }
  if (month) { conditions.push("MONTH(o.menu_date) = ?"); params.push(month); }
  if (companyId) { conditions.push("o.company_id = ?"); params.push(companyId); }
  if (mealType) { conditions.push("o.meal_type = ?"); params.push(mealType); }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  let selectCols, groupCols, orderCols;
  switch (groupBy) {
    case "year":
      selectCols = "YEAR(o.menu_date) AS period";
      groupCols = "YEAR(o.menu_date)";
      orderCols = "period";
      break;
    case "month":
      selectCols = "YEAR(o.menu_date) AS year, MONTH(o.menu_date) AS month";
      groupCols = "YEAR(o.menu_date), MONTH(o.menu_date)";
      orderCols = "year, month";
      break;
    case "company":
      selectCols = "o.company_id, c.company_name";
      groupCols = "o.company_id, c.company_name";
      orderCols = "total_count DESC";
      break;
    case "mealType":
      selectCols = "o.meal_type";
      groupCols = "o.meal_type";
      orderCols = "o.meal_type";
      break;
    default:
      throw new Error("invalid groupBy");
  }

  const sql = `
    SELECT ${selectCols}, SUM(o.order_count) AS total_count
    FROM tb_order o
    JOIN tb_company c ON c.company_id = o.company_id
    ${whereClause}
    GROUP BY ${groupCols}
    ORDER BY ${orderCols}
  `;

  return query(sql, params);
};

const getSummary = ({ year, month, companyId, mealType }) => {
  const conditions = [];
  const params = [];

  if (year) { conditions.push("YEAR(o.menu_date) = ?"); params.push(year); }
  if (month) { conditions.push("MONTH(o.menu_date) = ?"); params.push(month); }
  if (companyId) { conditions.push("o.company_id = ?"); params.push(companyId); }
  if (mealType) { conditions.push("o.meal_type = ?"); params.push(mealType); }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT SUM(o.order_count) AS total_count, COUNT(DISTINCT o.company_id) AS company_count
    FROM tb_order o
    ${whereClause}
  `;

  return query(sql, params).then((rows) => rows[0]);
};

module.exports = { getStats, getSummary };