/*
  Warnings:

  - You are about to drop the `_EventChildren` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EventChildren" DROP CONSTRAINT "_EventChildren_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventChildren" DROP CONSTRAINT "_EventChildren_B_fkey";

-- DropTable
DROP TABLE "_EventChildren";

-- CreateTable
CREATE TABLE "EventOnChildren" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,

    CONSTRAINT "EventOnChildren_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventOnChildren" ADD CONSTRAINT "EventOnChildren_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOnChildren" ADD CONSTRAINT "EventOnChildren_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
