const {prismaPg} = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma/client");

const adapter = prismaPg({
    connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({adapter});

module.exports = prisma;