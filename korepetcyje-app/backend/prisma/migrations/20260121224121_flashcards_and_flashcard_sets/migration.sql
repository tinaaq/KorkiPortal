/*
  Warnings:

  - You are about to drop the column `answer` on the `Flashcard` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `Flashcard` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Flashcard` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[flashcardId,studentId]` on the table `FlashcardAssignment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `back` to the `Flashcard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `front` to the `Flashcard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setId` to the `Flashcard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Flashcard" DROP COLUMN "answer",
DROP COLUMN "question",
DROP COLUMN "updatedAt",
ADD COLUMN     "back" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "front" TEXT NOT NULL,
ADD COLUMN     "setId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "FlashcardSet" (
    "id" SERIAL NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlashcardSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashcardSetAssignment" (
    "id" SERIAL NOT NULL,
    "setId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "FlashcardSetAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlashcardSetAssignment_setId_studentId_key" ON "FlashcardSetAssignment"("setId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "FlashcardAssignment_flashcardId_studentId_key" ON "FlashcardAssignment"("flashcardId", "studentId");

-- AddForeignKey
ALTER TABLE "FlashcardSet" ADD CONSTRAINT "FlashcardSet_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_setId_fkey" FOREIGN KEY ("setId") REFERENCES "FlashcardSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardSetAssignment" ADD CONSTRAINT "FlashcardSetAssignment_setId_fkey" FOREIGN KEY ("setId") REFERENCES "FlashcardSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardSetAssignment" ADD CONSTRAINT "FlashcardSetAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
