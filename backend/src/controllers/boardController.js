const prisma = require("../config/prisma");
const {
  createBoardSchema,
  updateBoardSchema,
  saveCanvasSchema,
  inviteCollaboratorSchema,
  updateCollaboratorRoleSchema,
} = require("../validators/boardSchemas");

async function getBoardAccess(boardId, userId) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
      collaborators: {
        where: { userId },
        select: {
          id: true,
          role: true,
        },
      },
    },
  });

  if (!board) return null;

  if (board.ownerId === userId) {
    return { role: "OWNER", board };
  }

  if (board.collaborators && board.collaborators.length > 0) {
    return {
      role: board.collaborators[0].role,
      board,
      collaboratorId: board.collaborators[0].id,
    };
  }

  return null;
}

const createBoard = async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        message: "Workspace ID is required",
      });
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ownerId: req.user.userId,
      },
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found or unauthorized",
      });
    }

    const result = createBoardSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid board details",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { title, description } = result.data;
    const board = await prisma.board.create({
      data: {
        title,
        description: description || null,
        workspaceId,
        ownerId: req.user.userId,
        elements: [],
        appState: {},
        isFavorite: false,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Board created successfully",
      board,
    });
  } catch (error) {
    console.error("Create board error:", error);
    return res.status(500).json({
      message: "Something went wrong while creating the board",
    });
  }
};

const getWorkspaceBoards = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ownerId: req.user.userId,
      },
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const boards = await prisma.board.findMany({
      where: {
        workspaceId,
        ownerId: req.user.userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.status(200).json({
      boards,
    });
  } catch (error) {
    console.error("Fetch workspace boards error:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching workspace boards",
    });
  }
};

const getRecentBoards = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;

    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: req.user.userId },
          { collaborators: { some: { userId: req.user.userId } } },
        ],
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        collaborators: {
          where: { userId: req.user.userId },
          select: { role: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: Math.min(limit, 20),
    });

    const enrichedBoards = boards.map((b) => ({
      ...b,
      role: b.ownerId === req.user.userId ? "OWNER" : b.collaborators[0]?.role || "VIEWER",
    }));

    return res.status(200).json({
      boards: enrichedBoards,
    });
  } catch (error) {
    console.error("Fetch recent boards error:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching recent boards",
    });
  }
};

const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const access = await getBoardAccess(id, req.user.userId);

    if (!access) {
      return res.status(404).json({
        message: "Board not found or access denied",
      });
    }

    return res.status(200).json({
      board: {
        ...access.board,
        userRole: access.role,
      },
    });
  } catch (error) {
    console.error("Fetch board error:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching the board",
    });
  }
};

const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.board.findFirst({
      where: {
        id,
        ownerId: req.user.userId,
      },
    });

    if (!existing) {
      return res.status(403).json({
        message: "Board not found or you are not the owner",
      });
    }

    const result = updateBoardSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid board update details",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const updateData = {};
    if (result.data.title !== undefined) updateData.title = result.data.title;
    if (result.data.description !== undefined) updateData.description = result.data.description;
    if (result.data.isFavorite !== undefined) updateData.isFavorite = result.data.isFavorite;

    const board = await prisma.board.update({
      where: { id },
      data: updateData,
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Board updated successfully",
      board,
    });
  } catch (error) {
    console.error("Update board error:", error);
    return res.status(500).json({
      message: "Something went wrong while updating the board",
    });
  }
};

const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.board.findFirst({
      where: {
        id,
        ownerId: req.user.userId,
      },
    });

    if (!existing) {
      return res.status(403).json({
        message: "Board not found or you are not the owner",
      });
    }

    await prisma.board.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Board deleted successfully",
    });
  } catch (error) {
    console.error("Delete board error:", error);
    return res.status(500).json({
      message: "Something went wrong while deleting the board",
    });
  }
};

const getBoardCanvas = async (req, res) => {
  try {
    const { id } = req.params;
    const access = await getBoardAccess(id, req.user.userId);

    if (!access) {
      return res.status(404).json({
        message: "Board not found or access denied",
      });
    }

    return res.status(200).json({
      id: access.board.id,
      title: access.board.title,
      elements: access.board.elements,
      appState: access.board.appState,
      updatedAt: access.board.updatedAt,
      workspace: access.board.workspace,
      userRole: access.role,
      ownerId: access.board.ownerId,
    });
  } catch (error) {
    console.error("Fetch board canvas error:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching board canvas",
    });
  }
};

const saveBoardCanvas = async (req, res) => {
  try {
    const { id } = req.params;
    const access = await getBoardAccess(id, req.user.userId);

    if (!access) {
      return res.status(404).json({
        message: "Board not found or access denied",
      });
    }

    if (access.role === "VIEWER") {
      return res.status(403).json({
        message: "Viewers are not permitted to edit this canvas",
      });
    }

    const result = saveCanvasSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid canvas data format",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { elements, appState } = result.data;
    const board = await prisma.board.update({
      where: { id },
      data: {
        elements: elements !== undefined ? elements : access.board.elements,
        appState: appState !== undefined ? appState : access.board.appState,
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "Canvas saved successfully",
      updatedAt: board.updatedAt,
    });
  } catch (error) {
    console.error("Save board canvas error:", error);
    return res.status(500).json({
      message: "Something went wrong while saving canvas data",
    });
  }
};

const getBoardCollaborators = async (req, res) => {
  try {
    const { id } = req.params;
    const access = await getBoardAccess(id, req.user.userId);

    if (!access) {
      return res.status(404).json({
        message: "Board not found or access denied",
      });
    }

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        invitations: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const collaborators = board.collaborators.map((c) => ({
      id: c.id,
      userId: c.user.id,
      name: c.user.name,
      email: c.user.email,
      role: c.role,
    }));

    return res.status(200).json({
      owner: {
        id: board.owner.id,
        name: board.owner.name,
        email: board.owner.email,
        role: "OWNER",
      },
      collaborators,
      invitations: board.invitations,
      userRole: access.role,
    });
  } catch (error) {
    console.error("Get collaborators error:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching collaborators",
    });
  }
};

const inviteCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const access = await getBoardAccess(id, req.user.userId);

    if (!access) {
      return res.status(404).json({
        message: "Board not found",
      });
    }

    if (access.role !== "OWNER") {
      return res.status(403).json({
        message: "Only the board owner can manage collaborators and invitations",
      });
    }

    const result = inviteCollaboratorSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0]?.message || "Invalid invitation details",
      });
    }

    const targetEmail = result.data.email.toLowerCase().trim();
    const role = result.data.role;

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        owner: true,
        collaborators: {
          include: { user: true },
        },
        invitations: {
          where: { status: "PENDING" },
        },
      },
    });

    if (board.owner.email.toLowerCase() === targetEmail) {
      return res.status(400).json({
        message: "You already own this board",
      });
    }

    const existingCollab = board.collaborators.find(
      (c) => c.user.email.toLowerCase() === targetEmail
    );
    if (existingCollab) {
      return res.status(400).json({
        message: "This person already has access to the board",
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (targetUser) {
      const collaborator = await prisma.boardCollaborator.create({
        data: {
          boardId: id,
          userId: targetUser.id,
          role,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      await prisma.boardInvitation.deleteMany({
        where: { boardId: id, email: targetEmail },
      });

      return res.status(201).json({
        message: "Collaborator added successfully",
        collaborator: {
          id: collaborator.id,
          userId: collaborator.user.id,
          name: collaborator.user.name,
          email: collaborator.user.email,
          role: collaborator.role,
        },
      });
    }

    const existingInvite = board.invitations.find(
      (inv) => inv.email.toLowerCase() === targetEmail
    );
    if (existingInvite) {
      return res.status(400).json({
        message: "An invitation has already been sent to this email address",
      });
    }

    const invitation = await prisma.boardInvitation.create({
      data: {
        boardId: id,
        email: targetEmail,
        role,
        status: "PENDING",
      },
    });

    return res.status(201).json({
      message: "Invitation sent successfully",
      invitation,
    });
  } catch (error) {
    console.error("Invite collaborator error:", error);
    return res.status(500).json({
      message: "Something went wrong while inviting collaborator",
    });
  }
};

const updateCollaboratorRole = async (req, res) => {
  try {
    const { id, collaboratorId } = req.params;
    const access = await getBoardAccess(id, req.user.userId);

    if (!access || access.role !== "OWNER") {
      return res.status(403).json({
        message: "Only the board owner can update collaborator roles",
      });
    }

    const result = updateCollaboratorRoleSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid role specified",
      });
    }

    const collaborator = await prisma.boardCollaborator.findFirst({
      where: { id: collaboratorId, boardId: id },
    });

    if (!collaborator) {
      return res.status(404).json({
        message: "Collaborator not found on this board",
      });
    }

    const updated = await prisma.boardCollaborator.update({
      where: { id: collaboratorId },
      data: { role: result.data.role },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(200).json({
      message: "Collaborator role updated successfully",
      collaborator: {
        id: updated.id,
        userId: updated.user.id,
        name: updated.user.name,
        email: updated.user.email,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error("Update collaborator role error:", error);
    return res.status(500).json({
      message: "Something went wrong while updating collaborator role",
    });
  }
};

const removeCollaborator = async (req, res) => {
  try {
    const { id, collaboratorId } = req.params;
    const access = await getBoardAccess(id, req.user.userId);

    if (!access || access.role !== "OWNER") {
      return res.status(403).json({
        message: "Only the board owner can remove collaborators",
      });
    }

    const collaborator = await prisma.boardCollaborator.findFirst({
      where: { id: collaboratorId, boardId: id },
    });

    if (!collaborator) {
      return res.status(404).json({
        message: "Collaborator not found on this board",
      });
    }

    await prisma.boardCollaborator.delete({
      where: { id: collaboratorId },
    });

    return res.status(200).json({
      message: "Collaborator removed successfully",
    });
  } catch (error) {
    console.error("Remove collaborator error:", error);
    return res.status(500).json({
      message: "Something went wrong while removing collaborator",
    });
  }
};

const cancelInvitation = async (req, res) => {
  try {
    const { id, invitationId } = req.params;
    const access = await getBoardAccess(id, req.user.userId);

    if (!access || access.role !== "OWNER") {
      return res.status(403).json({
        message: "Only the board owner can cancel invitations",
      });
    }

    const invitation = await prisma.boardInvitation.findFirst({
      where: { id: invitationId, boardId: id },
    });

    if (!invitation) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    await prisma.boardInvitation.delete({
      where: { id: invitationId },
    });

    return res.status(200).json({
      message: "Invitation canceled successfully",
    });
  } catch (error) {
    console.error("Cancel invitation error:", error);
    return res.status(500).json({
      message: "Something went wrong while canceling invitation",
    });
  }
};

module.exports = {
  createBoard,
  getWorkspaceBoards,
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
  getBoardAccess,
};
