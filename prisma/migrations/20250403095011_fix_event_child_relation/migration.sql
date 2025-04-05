/*
  Warnings:

  - You are about to drop the `_ChildToEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ChildToEvent" DROP CONSTRAINT "_ChildToEvent_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChildToEvent" DROP CONSTRAINT "_ChildToEvent_B_fkey";

-- DropTable
DROP TABLE "_ChildToEvent";

-- CreateTable
CREATE TABLE "_EventChildren" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventChildren_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventChildren_B_index" ON "_EventChildren"("B");

-- AddForeignKey
ALTER TABLE "_EventChildren" ADD CONSTRAINT "_EventChildren_A_fkey" FOREIGN KEY ("A") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventChildren" ADD CONSTRAINT "_EventChildren_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
