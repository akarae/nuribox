const { query } = require("../config/db");

// 월간 정산 (tb_settlement) - 단가는 현재 전업체 동일가라 정산 시점에 apply_price 직접 입력
// (추후 업체별 단가 도입 시 tb_price 테이블 분리 예정)
const findByMonth = (year, month) =>
  query("SELECT * FROM tb_settlement WHERE settlement_year = ? AND settlement_month = ?", [
    year,
    month,
  ]);
const upsert = (data) =>
  query(
    `INSERT INTO tb_settlement
       (company_id, settlement_year, settlement_month, total_count, apply_price, total_amount, paid_yn)
     VALUES (?, ?, ?, ?, ?, ?, 'N')
     ON DUPLICATE KEY UPDATE
       total_count = VALUES(total_count),
       apply_price = VALUES(apply_price),
       total_amount = VALUES(total_amount)`,
    [
      data.companyId,
      data.year,
      data.month,
      data.totalCount,
      data.applyPrice,
      data.totalAmount,
    ]
  );
const markPaid = (settlementId) =>
  query(
    "UPDATE tb_settlement SET paid_yn = 'Y', paid_at = NOW() WHERE settlement_id = ?",
    [settlementId]
  );

  // 전체 업체 기준으로 확정여부와 상관없이 목록 표시 (미확정 업체도 노출)
const findAllWithStatus = (year, month) =>
  query(
    `SELECT c.company_id, c.company_name, s.settlement_id, s.total_count, s.apply_price, s.total_amount, s.paid_yn, s.paid_at
     FROM tb_company c
     LEFT JOIN tb_settlement s
       ON s.company_id = c.company_id AND s.settlement_year = ? AND s.settlement_month = ?
     WHERE c.status != '삭제'
     ORDER BY c.company_name`,
    [year, month]
  );

module.exports = { findByMonth, findAllWithStatus, upsert, markPaid };
