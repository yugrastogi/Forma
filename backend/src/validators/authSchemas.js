const {z} = require("zod");

const signupSchema = z.object({
    name: z.string().trim().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email address").transform((email) => email.toLowerCase()),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

const loginSchema = z.object({
    email: z.string().trim().email("Invalid email address").transform((email) => email.toLowerCase()),
    password: z.string().min(1, "Password is required"),
});

module.exports = {
    signupSchema,
    loginSchema
};  