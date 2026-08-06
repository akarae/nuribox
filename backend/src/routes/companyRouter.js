const router = require("express").Router();
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  createAccount,
  getAccount, 
  updateAccountPassword,
  getMyCompany
} = require("../controllers/companyController");

// 업체관리 - 관리자 전용
router.get("/", authMiddleware, adminMiddleware, getCompanies);
router.post("/", authMiddleware, adminMiddleware, createCompany);
router.put("/:companyId", authMiddleware, adminMiddleware, updateCompany);
router.delete("/:companyId", authMiddleware, adminMiddleware, deleteCompany); // 논리삭제(status='삭제')
router.post("/account", authMiddleware, adminMiddleware, createAccount);
router.get("/:companyId/account", authMiddleware, adminMiddleware, getAccount);
router.put("/account/:userId", authMiddleware, adminMiddleware, updateAccountPassword);
router.get("/me", authMiddleware, getMyCompany);

module.exports = router;
