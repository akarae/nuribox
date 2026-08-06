const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const { getSettlements, confirmSettlement, markPaid, previewOrderCount } = require("../controllers/settlementController");

router.get("/", authMiddleware, adminMiddleware, getSettlements);
router.get("/preview", authMiddleware, adminMiddleware, previewOrderCount);
router.post("/confirm", authMiddleware, adminMiddleware, confirmSettlement);
router.patch("/:settlementId/paid", authMiddleware, adminMiddleware, markPaid);

module.exports = router;