require("dotenv").config();
const express = require("express");
const cors = require("cors");
const logger = require("./src/config/logger");
const { pool } = require("./src/config/db");

const authRouter = require("./src/routes/authRouter");
const companyRouter = require("./src/routes/companyRouter");
const menuRouter = require("./src/routes/menuRouter");
const orderRouter = require("./src/routes/orderRouter");
const settlementRouter = require("./src/routes/settlementRouter");
const codeRouter = require("./src/routes/codeRouter");
const statisticsRouter = require("./src/routes/statisticsRouter");

const app = express();
app.use(cors());
app.use(express.json());

// 헬스체크 - 서버/DB 연결 확인용
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    logger.error(`DB health check failed: ${err.message}`);
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/companies", companyRouter);
app.use("/api/menus", menuRouter);
app.use("/api/orders", orderRouter);
app.use("/api/settlements", settlementRouter);
app.use("/api/codes", codeRouter);
app.use("/api/statistics", statisticsRouter);

module.exports = app;