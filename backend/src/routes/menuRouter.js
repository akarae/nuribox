const router = require("express").Router();
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const { getWeekMenu, getMenuRange, saveMenu, deleteMenu } = require("../controllers/menuController");

// 조회는 로그인한 모든 업체 담당자 가능, 등록/수정/삭제는 관리자 전용
router.get("/", authMiddleware, getWeekMenu);
router.post("/", authMiddleware, adminMiddleware, saveMenu);
router.delete("/:menuId", authMiddleware, adminMiddleware, deleteMenu);
router.get("/range", authMiddleware, getMenuRange); // 업체 담당자도 조회 가능 (관리자 권한 불필요)

module.exports = router;
