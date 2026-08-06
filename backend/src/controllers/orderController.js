const orderModel = require("../models/orderModel");
const logger = require("../config/logger");

// 업체별 식수신청 조회 (담당자 화면) - query: startDate, endDate
const getMyOrders = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { companyId } = req.user;
    res.json(await orderModel.findByCompanyDateRange(companyId, startDate, endDate));
  } catch (err) {
    logger.error(`getMyOrders error: ${err.message}`);
    res.status(500).json({ message: "식수 신청 내역 조회 실패" });
  }
};

// 식수신청 등록/수정 - body: { menuDate, mealType, orderCount }
const saveOrder = async (req, res) => {
  try {
    const { companyId } = req.user;
    await orderModel.upsert({ ...req.body, companyId });
    res.json({ message: "식수 신청이 저장되었습니다." });
  } catch (err) {
    logger.error(`saveOrder error: ${err.message}`);
    res.status(500).json({ message: "식수 신청 저장 실패" });
  }
};

// 관리자 - 전체 업체 식수현황 조회
const getAllOrders = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    res.json(await orderModel.findAllByDateRange(startDate, endDate));
  } catch (err) {
    logger.error(`getAllOrders error: ${err.message}`);
    res.status(500).json({ message: "식수 현황 조회 실패" });
  }
};

// 통계관리 - 월별/일자별/요일별 집계
const getStats = async (req, res) => {
  try {
    const { year, month } = req.query;
    res.json(await orderModel.statsByMonth(year, month));
  } catch (err) {
    logger.error(`getStats error: ${err.message}`);
    res.status(500).json({ message: "통계 조회 실패" });
  }
};

module.exports = { getMyOrders, saveOrder, getAllOrders, getStats };
