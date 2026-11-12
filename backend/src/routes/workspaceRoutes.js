const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} = require("../controllers/workspaceController");
const {
  createBoard,
  getWorkspaceBoards,
} = require("../controllers/boardController");

const router = express.Router();

router.use(requireAuth);

router.post("/", createWorkspace);
router.get("/", getUserWorkspaces);
router.get("/:id", getWorkspaceById);
router.patch("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);

router.post("/:workspaceId/boards", createBoard);
router.get("/:workspaceId/boards", getWorkspaceBoards);

module.exports = router;
