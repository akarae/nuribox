const statisticsModel = require("../models/statisticsModel");
const logger = require("../config/logger");

const getStatistics = async (req, res) => {
  try {
    const { year, month, companyId, mealType, groupBy } = req.query;
    if (!groupBy) {
      return res.status(400).json({ message: "조회기준(groupBy)이 필요합니다." });
    }
    const rows = await statisticsModel.getStats({ year, month, companyId, mealType, groupBy });
    const summary = await statisticsModel.getSummary({ year, month, companyId, mealType });
    res.json({ rows, summary });
  } catch (err) {
    logger.error(`getStatistics error: ${err.message}`);
    res.status(500).json({ message: "통계 조회 실패" });
  }
};

module.exports = { getStatistics };