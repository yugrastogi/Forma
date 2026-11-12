const prisma = require("../config/prisma");
const { createWorkspaceSchema, updateWorkspaceSchema } = require("../validators/workspaceSchemas");

const createWorkspace = async (req, res) => {
  try {
    const result = createWorkspaceSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid workspace details",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { name } = result.data;
    const workspace = await prisma.workspace.create({
      data: {
        name,
        ownerId: req.user.userId,
      },
      include: {
        _count: {
          select: { boards: true },
        },
      },
    });

    return res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    console.error("Create workspace error:", error);
    return res.status(500).json({
      message: "Something went wrong while creating the workspace",
    });
  }
};

const getUserWorkspaces = async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        ownerId: req.user.userId,
      },
      include: {
        _count: {
          select: { boards: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.status(200).json({
      workspaces,
    });
  } catch (error) {
    console.error("Fetch workspaces error:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching workspaces",
    });
  }
};

const getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params;

    const workspace = await prisma.workspace.findFirst({
      where: {
        id,
        ownerId: req.user.userId,
      },
      include: {
        boards: {
          orderBy: {
            updatedAt: "desc",
          },
        },
        _count: {
          select: { boards: true },
        },
      },
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    return res.status(200).json({
      workspace,
    });
  } catch (error) {
    console.error("Fetch workspace error:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching the workspace",
    });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const result = updateWorkspaceSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid workspace details",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const existing = await prisma.workspace.findFirst({
      where: {
        id,
        ownerId: req.user.userId,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const { name } = result.data;
    const workspace = await prisma.workspace.update({
      where: { id },
      data: { name },
      include: {
        _count: {
          select: { boards: true },
        },
      },
    });

    return res.status(200).json({
      message: "Workspace updated successfully",
      workspace,
    });
  } catch (error) {
    console.error("Update workspace error:", error);
    return res.status(500).json({
      message: "Something went wrong while updating the workspace",
    });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.workspace.findFirst({
      where: {
        id,
        ownerId: req.user.userId,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    await prisma.workspace.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    console.error("Delete workspace error:", error);
    return res.status(500).json({
      message: "Something went wrong while deleting the workspace",
    });
  }
};

module.exports = {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
};

