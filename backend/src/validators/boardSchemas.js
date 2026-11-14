const { z } = require("zod");

const createBoardSchema = z.object({
  title: z.string().trim().min(1, "Board title is required").max(100, "Board title cannot exceed 100 characters"),
  description: z.string().trim().max(300, "Description cannot exceed 300 characters").optional().nullable(),
});

const updateBoardSchema = z.object({
  title: z.string().trim().min(1, "Board title is required").max(100, "Board title cannot exceed 100 characters").optional(),
  description: z.string().trim().max(300, "Description cannot exceed 300 characters").optional().nullable(),
  isFavorite: z.boolean().optional(),
});

const saveCanvasSchema = z.object({
  elements: z.array(z.any()).optional().default([]),
  appState: z.record(z.string(), z.any()).optional().default({}),
});

const inviteCollaboratorSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  role: z.enum(["EDITOR", "VIEWER"]).default("EDITOR"),
});

const updateCollaboratorRoleSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"]),
});

module.exports = {
  createBoardSchema,
  updateBoardSchema,
  saveCanvasSchema,
  inviteCollaboratorSchema,
  updateCollaboratorRoleSchema,
};
