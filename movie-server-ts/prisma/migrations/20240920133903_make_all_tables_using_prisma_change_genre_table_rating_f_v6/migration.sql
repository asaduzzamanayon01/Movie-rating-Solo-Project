-- DropForeignKey
ALTER TABLE "Rate" DROP CONSTRAINT "Rate_movieId_fkey";

-- DropForeignKey
ALTER TABLE "Rate" DROP CONSTRAINT "Rate_userId_fkey";

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
