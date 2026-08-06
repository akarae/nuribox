const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const { getStatistics } = require("../controllers/statisticsController");

router.get("/", authMiddleware, adminMiddleware, getStatistics);

module.exports = router;