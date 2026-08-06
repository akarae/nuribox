const router = require("express").Router();
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const { getMyOrders, saveOrder, getAllOrders, getStats } = require("../controllers/orderController");

// 식수신청 - 업체 담당자 (query: startDate, endDate)
router.get("/my", authMiddleware, getMyOrders);
router.post("/my", authMiddleware, saveOrder);

// 식수관리 / 통계관리 - 관리자 전용
router.get("/all", authMiddleware, adminMiddleware, getAllOrders);
router.get("/stats", authMiddleware, adminMiddleware, getStats);

module.exports = router;
