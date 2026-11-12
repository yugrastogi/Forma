const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma/client");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;