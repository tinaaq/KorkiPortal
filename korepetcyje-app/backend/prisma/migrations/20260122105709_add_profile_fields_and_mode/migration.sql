/*
  Warnings:

  - You are about to drop the column `name` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `TutorProfile` table. All the data in the column will be lost.
  - Added the required column `mode` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `TutorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `TutorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mode` to the `TutorProfile` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `subjects` on the `TutorProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Mode" AS ENUM ('ONLINE', 'OFFLINE', 'BOTH');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "address" TEXT,
ADD COLUMN     "mode" "Mode" NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "name",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TutorProfile" DROP COLUMN "name",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "mode" "Mode" NOT NULL,
DROP COLUMN "subjects",
ADD COLUMN     "subjects" JSONB NOT NULL;
