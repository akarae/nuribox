const codeModel = require("../models/codeModel");
const logger = require("../config/logger");

const getCodes = async (req, res) => {
  try {
    res.json(await codeModel.findByGroup(req.params.groupCode));
  } catch (err) {
    logger.error(`getCodes error: ${err.message}`);
    res.status(500).json({ message: "공통코드 조회 실패" });
  }
};

const createCode = async (req, res) => {
  try {
    await codeModel.create(req.body);
    res.status(201).json({ message: "코드가 등록되었습니다." });
  } catch (err) {
    logger.error(`createCode error: ${err.message}`);
    res.status(500).json({ message: "코드 등록 실패" });
  }
};

const updateCode = async (req, res) => {
  try {
    await codeModel.update(req.params.codeId, req.body);
    res.json({ message: "코드가 수정되었습니다." });
  } catch (err) {
    logger.error(`updateCode error: ${err.message}`);
    res.status(500).json({ message: "코드 수정 실패" });
  }
};

const deleteCode = async (req, res) => {
  try {
    await codeModel.remove(req.params.codeId);
    res.json({ message: "코드가 삭제되었습니다." });
  } catch (err) {
    logger.error(`deleteCode error: ${err.message}`);
    res.status(500).json({ message: "코드 삭제 실패" });
  }
};

const getGroups = async (req, res) => {
  try {
    const rows = await codeModel.findAllGroups();
    res.json(rows.map((r) => r.group_code));
  } catch (err) {
    logger.error(`getGroups error: ${err.message}`);
    res.status(500).json({ message: "그룹코드 목록 조회 실패" });
  }
};

module.exports = { getCodes, createCode, updateCode, deleteCode, getGroups };
