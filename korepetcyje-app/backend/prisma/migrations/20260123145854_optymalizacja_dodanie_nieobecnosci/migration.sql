/*
  Warnings:

  - You are about to drop the column `subject` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `tutorId` on the `Flashcard` table. All the data in the column will be lost.
  - The primary key for the `FlashcardSetAssignment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `FlashcardSetAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `subjects` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the `FlashcardAssignment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `subjectId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LessonLocation" AS ENUM ('AT_STUDENT', 'AT_TUTOR');

-- DropForeignKey
ALTER TABLE "Flashcard" DROP CONSTRAINT "Flashcard_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "FlashcardAssignment" DROP CONSTRAINT "FlashcardAssignment_flashcardId_fkey";

-- DropForeignKey
ALTER TABLE "FlashcardAssignment" DROP CONSTRAINT "FlashcardAssignment_studentId_fkey";

-- DropIndex
DROP INDEX "FlashcardSetAssignment_setId_studentId_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "subject",
ADD COLUMN     "location" "LessonLocation",
ADD COLUMN     "subjectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Flashcard" DROP COLUMN "tutorId";

-- AlterTable
ALTER TABLE "FlashcardSetAssignment" DROP CONSTRAINT "FlashcardSetAssignment_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "FlashcardSetAssignment_pkey" PRIMARY KEY ("setId", "studentId");

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "school" TEXT;

-- AlterTable
ALTER TABLE "TutorProfile" DROP COLUMN "subjects";

-- DropTable
DROP TABLE "FlashcardAssignment";

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorSubject" (
    "tutorId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "priceInfo" TEXT NOT NULL,

    CONSTRAINT "TutorSubject_pkey" PRIMARY KEY ("tutorId","subjectId")
);

-- CreateTable
CREATE TABLE "TutorUnavailability" (
    "id" SERIAL NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "TutorUnavailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE INDEX "TutorUnavailability_tutorId_startAt_idx" ON "TutorUnavailability"("tutorId", "startAt");

-- CreateIndex
CREATE INDEX "Availability_tutorId_dayOfWeek_idx" ON "Availability"("tutorId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "Booking_studentId_startAt_idx" ON "Booking"("studentId", "startAt");

-- CreateIndex
CREATE INDEX "Flashcard_setId_idx" ON "Flashcard"("setId");

-- AddForeignKey
ALTER TABLE "TutorSubject" ADD CONSTRAINT "TutorSubject_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorSubject" ADD CONSTRAINT "TutorSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorUnavailability" ADD CONSTRAINT "TutorUnavailability_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
