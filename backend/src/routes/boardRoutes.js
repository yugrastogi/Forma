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
  getBoardCollaborators,
  inviteCollaborator,
  updateCollaboratorRole,
  removeCollaborator,
  cancelInvitation,
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

router.get("/:id/collaborators", getBoardCollaborators);
router.post("/:id/collaborators", inviteCollaborator);
router.patch("/:id/collaborators/:collaboratorId", updateCollaboratorRole);
router.delete("/:id/collaborators/:collaboratorId", removeCollaborator);
router.delete("/:id/invitations/:invitationId", cancelInvitation);

module.exports = router;
