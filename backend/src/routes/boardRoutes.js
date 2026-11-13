const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  createBoard,
  getRecentBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  getBoardCanvas,
  saveBoardCanvas,
} = require("../controllers/boardController");

const router = express.Router();

router.use(requireAuth);

router.post("/", createBoard);
router.get("/recent", getRecentBoards);
router.get("/:id", getBoardById);
router.patch("/:id", updateBoard);
router.delete("/:id", deleteBoard);

router.get("/:id/canvas", getBoardCanvas);
router.put("/:id/canvas", saveBoardCanvas);

module.exports = router;
