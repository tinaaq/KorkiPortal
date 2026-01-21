/*
  Warnings:

  - You are about to drop the column `endTime` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Booking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tutorId,dayOfWeek,startTime,endTime]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dayOfWeek` to the `Availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAt` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Booking_tutorId_startTime_endTime_key";

-- AlterTable
ALTER TABLE "Availability" ADD COLUMN     "dayOfWeek" INTEGER NOT NULL,
ALTER COLUMN "startTime" SET DATA TYPE TEXT,
ALTER COLUMN "endTime" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "endAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Availability_tutorId_dayOfWeek_startTime_endTime_key" ON "Availability"("tutorId", "dayOfWeek", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "Booking_tutorId_startAt_idx" ON "Booking"("tutorId", "startAt");
