/*
  Warnings:

  - A unique constraint covering the columns `[userId,movieId]` on the table `Rate` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profile" VARCHAR(150);

-- CreateIndex
CREATE UNIQUE INDEX "Rate_userId_movieId_key" ON "Rate"("userId", "movieId");
