/*
  Warnings:

  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `invitationCode` on the `Invitation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `end` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Made the column `status` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `code` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Invitation_invitationCode_key";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "date",
DROP COLUMN "time",
ADD COLUMN     "end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "invitationCode",
ADD COLUMN     "code" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "EventOnChildren" (
    "eventId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,

    CONSTRAINT "EventOnChildren_pkey" PRIMARY KEY ("eventId","childId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_code_key" ON "Invitation"("code");

-- AddForeignKey
ALTER TABLE "EventOnChildren" ADD CONSTRAINT "EventOnChildren_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOnChildren" ADD CONSTRAINT "EventOnChildren_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
