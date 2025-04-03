-- DropIndex
DROP INDEX "ParentalAccount_name_key";

-- AlterTable
ALTER TABLE "ParentalAccount" ADD COLUMN     "decidedOnChildren" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "decidedOnParents" BOOLEAN NOT NULL DEFAULT false;
