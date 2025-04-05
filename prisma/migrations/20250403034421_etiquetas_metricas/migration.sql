/*
  Warnings:

  - You are about to drop the `EventOnChildren` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventOnChildren" DROP CONSTRAINT "EventOnChildren_childId_fkey";

-- DropForeignKey
ALTER TABLE "EventOnChildren" DROP CONSTRAINT "EventOnChildren_eventId_fkey";

-- DropTable
DROP TABLE "EventOnChildren";

-- CreateTable
CREATE TABLE "_ChildrenOnEvents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChildrenOnEvents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChildrenOnEvents_B_index" ON "_ChildrenOnEvents"("B");

-- AddForeignKey
ALTER TABLE "_ChildrenOnEvents" ADD CONSTRAINT "_ChildrenOnEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChildrenOnEvents" ADD CONSTRAINT "_ChildrenOnEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
