/*
  Warnings:

  - You are about to drop the column `code` on the `Invitation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invitationCode]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invitationCode` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Invitation_code_key";

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "code",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "invitationCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_invitationCode_key" ON "Invitation"("invitationCode");
