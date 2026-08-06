const router = require("express").Router();
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const { getCodes, getGroups, createCode, updateCode, deleteCode } = require("../controllers/codeController");

// 공통코드 - 조회는 로그인 사용자 전체, 등록/수정/삭제는 관리자 전용
router.get("/groups", authMiddleware, getGroups);
router.get("/:groupCode", authMiddleware, getCodes);
router.post("/", authMiddleware, adminMiddleware, createCode);
router.put("/:codeId", authMiddleware, adminMiddleware, updateCode);
router.delete("/:codeId", authMiddleware, adminMiddleware, deleteCode);

module.exports = router;