/*
  Warnings:

  - A unique constraint covering the columns `[invitationCode]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invitationCode` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "invitationCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_invitationCode_key" ON "Invitation"("invitationCode");
