/*
  Warnings:

  - You are about to drop the column `alcohol` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `certificate` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `episodes` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `frightening` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `nudity` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `profanity` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `violence` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `votes` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "alcohol",
DROP COLUMN "certificate",
DROP COLUMN "episodes",
DROP COLUMN "frightening",
DROP COLUMN "nudity",
DROP COLUMN "profanity",
DROP COLUMN "type",
DROP COLUMN "violence",
DROP COLUMN "votes";
