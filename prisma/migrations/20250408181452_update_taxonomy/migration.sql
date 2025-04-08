-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "meetingLink" TEXT,
ADD COLUMN     "recurrenceRule" TEXT,
ADD COLUMN     "timezone" TEXT;

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "minutesBefore" INTEGER NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
