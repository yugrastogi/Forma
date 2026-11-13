const prisma = require("../config/prisma");
const { createBoardSchema, updateBoardSchema, saveCanvasSchema } = require("../validators/boardSchemas");

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
        ownerId: req.user.userId,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: Math.min(limit, 20),
    });

    return res.status(200).json({
      boards,
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

    const board = await prisma.board.findFirst({
      where: {
        id,
        ownerId: req.user.userId,
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

    if (!board) {
      return res.status(404).json({
        message: "Board not found",
      });
    }

    return res.status(200).json({
      board,
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
      return res.status(404).json({
        message: "Board not found",
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
      return res.status(404).json({
        message: "Board not found",
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

    const board = await prisma.board.findFirst({
      where: {
        id,
        ownerId: req.user.userId,
      },
      select: {
        id: true,
        title: true,
        elements: true,
        appState: true,
        updatedAt: true,
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!board) {
      return res.status(404).json({
        message: "Board not found",
      });
    }

    return res.status(200).json({
      id: board.id,
      title: board.title,
      elements: board.elements,
      appState: board.appState,
      updatedAt: board.updatedAt,
      workspace: board.workspace,
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

    const existing = await prisma.board.findFirst({
      where: {
        id,
        ownerId: req.user.userId,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Board not found",
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
        elements: elements !== undefined ? elements : existing.elements,
        appState: appState !== undefined ? appState : existing.appState,
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

module.exports = {
  createBoard,
  getWorkspaceBoards,
  getRecentBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  getBoardCanvas,
  saveBoardCanvas,
};

