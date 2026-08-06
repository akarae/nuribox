const menuModel = require("../models/menuModel");
const logger = require("../config/logger");

// 주간 식단 조회 (전업체 동일 식단)
const getWeekMenu = async (req, res) => {
  try {
    const { year, month, week } = req.query;
    res.json(await menuModel.findByWeek(year, month, week));
  } catch (err) {
    logger.error(`getWeekMenu error: ${err.message}`);
    res.status(500).json({ message: "식단 조회 실패" });
  }
};

// 요일별 메뉴 등록/수정 (자유 text)
// body: { menuDate, year, month, week, weekday, mealType, menuText, status }
const saveMenu = async (req, res) => {
  try {
    await menuModel.upsert(req.body);
    res.json({ message: "식단이 저장되었습니다." });
  } catch (err) {
    logger.error(`saveMenu error: ${err.message}`);
    res.status(500).json({ message: "식단 저장 실패" });
  }
};

const deleteMenu = async (req, res) => {
  try {
    await menuModel.remove(req.params.menuId);
    res.json({ message: "식단이 삭제되었습니다." });
  } catch (err) {
    logger.error(`deleteMenu error: ${err.message}`);
    res.status(500).json({ message: "식단 삭제 실패" });
  }
};

const getMenuRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // 업체 계정은 서버단에서 '제공중(S)' 상태만 강제로 필터링 (클라이언트가 우회 불가)
    const status = req.user.role === "company" ? "S" : undefined;
    res.json(await menuModel.findByDateRange(startDate, endDate, status));
  } catch (err) {
    logger.error(`getMenuRange error: ${err.message}`);
    res.status(500).json({ message: "식단 조회 실패" });
  }
};

module.exports = { getWeekMenu, saveMenu, deleteMenu, getMenuRange };
