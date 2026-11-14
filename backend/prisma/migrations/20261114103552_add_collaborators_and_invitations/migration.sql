-- CreateEnum
CREATE TYPE "BoardRole" AS ENUM ('EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "BoardCollaborator" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "BoardRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoardCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardInvitation" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "BoardRole" NOT NULL DEFAULT 'EDITOR',
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoardInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardCollaborator_boardId_userId_key" ON "BoardCollaborator"("boardId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardInvitation_boardId_email_key" ON "BoardInvitation"("boardId", "email");

-- AddForeignKey
ALTER TABLE "BoardCollaborator" ADD CONSTRAINT "BoardCollaborator_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardCollaborator" ADD CONSTRAINT "BoardCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardInvitation" ADD CONSTRAINT "BoardInvitation_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
