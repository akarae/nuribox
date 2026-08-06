const settlementModel = require("../models/settlementModel");
const orderModel = require("../models/orderModel");
const logger = require("../config/logger");

// 월간 정산 목록
const getSettlements = async (req, res) => {
  try {
    const { year, month } = req.query;
    res.json(await settlementModel.findAllWithStatus(year, month));
  } catch (err) {
    logger.error(`getSettlements error: ${err.message}`);
    res.status(500).json({ message: "정산 조회 실패" });
  }
};

// 정산 확정 - 그 달 식수 합계를 조회해서 단가(applyPrice)를 곱해 청구금액 계산 후 저장
// body: { companyId, year, month, applyPrice }
const confirmSettlement = async (req, res) => {
  try {
    const { companyId, year, month, applyPrice } = req.body;
    const orders = await orderModel.findByCompanyDateRange(
      companyId,
      `${year}-${String(month).padStart(2, "0")}-01`,
      `${year}-${String(month).padStart(2, "0")}-31`
    );
    const totalCount = orders.reduce((sum, o) => sum + o.order_count, 0);
    const totalAmount = totalCount * applyPrice;

    await settlementModel.upsert({
      companyId,
      year,
      month,
      totalCount,
      applyPrice,
      totalAmount,
    });

    res.json({ message: "정산이 확정되었습니다.", totalCount, totalAmount });
  } catch (err) {
    logger.error(`confirmSettlement error: ${err.message}`);
    res.status(500).json({ message: "정산 확정 실패" });
  }
};

const previewOrderCount = async (req, res) => {
  try {
    const { companyId, year, month } = req.query;
    const orders = await orderModel.findByCompanyDateRange(
      companyId,
      `${year}-${String(month).padStart(2, "0")}-01`,
      `${year}-${String(month).padStart(2, "0")}-31`
    );
    const totalCount = orders.reduce((sum, o) => sum + o.order_count, 0);
    res.json({ totalCount });
  } catch (err) {
    logger.error(`previewOrderCount error: ${err.message}`);
    res.status(500).json({ message: "식수 조회 실패" });
  }
};

const markPaid = async (req, res) => {
  try {
    await settlementModel.markPaid(req.params.settlementId);
    res.json({ message: "입금 확인 처리되었습니다." });
  } catch (err) {
    logger.error(`markPaid error: ${err.message}`);
    res.status(500).json({ message: "입금 처리 실패" });
  }
};

module.exports = { getSettlements, confirmSettlement, markPaid, previewOrderCount };
