/*
  Warnings:

  - You are about to drop the column `details` on the `Address` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "details",
ADD COLUMN     "departmentNumber" TEXT;
