/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ParentalAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ParentalAccount_name_key" ON "ParentalAccount"("name");
