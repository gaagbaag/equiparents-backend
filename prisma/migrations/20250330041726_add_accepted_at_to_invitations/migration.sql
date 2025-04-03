/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `accepted` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `invitationCode` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `decidedOnChildren` on the `ParentalAccount` table. All the data in the column will be lost.
  - You are about to drop the column `decidedOnParents` on the `ParentalAccount` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ParentalAccount` table. All the data in the column will be lost.
  - You are about to drop the column `countryCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `User` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `Child` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invitedById` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Child" DROP CONSTRAINT "Child_userId_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_senderId_fkey";

-- DropIndex
DROP INDEX "Invitation_invitationCode_key";

-- AlterTable
ALTER TABLE "Child" DROP COLUMN "dateOfBirth",
DROP COLUMN "name",
DROP COLUMN "userId",
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "email" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "accepted",
DROP COLUMN "invitationCode",
DROP COLUMN "senderId",
ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "invitedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ParentalAccount" DROP COLUMN "decidedOnChildren",
DROP COLUMN "decidedOnParents",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "countryCode",
DROP COLUMN "name",
DROP COLUMN "picture",
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
