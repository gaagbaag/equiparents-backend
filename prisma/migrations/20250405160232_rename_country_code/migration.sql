/*
  Warnings:

  - You are about to drop the column `countryCode` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "countryCode",
ADD COLUMN     "countryDialCode" TEXT;
