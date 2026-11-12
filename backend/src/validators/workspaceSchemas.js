const { z } = require("zod");

const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Workspace name is required").max(60, "Workspace name cannot exceed 60 characters"),
});

const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Workspace name is required").max(60, "Workspace name cannot exceed 60 characters"),
});

module.exports = {
  createWorkspaceSchema,
  updateWorkspaceSchema,
};

