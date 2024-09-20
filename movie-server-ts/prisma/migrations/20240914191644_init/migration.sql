-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "address" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "image" VARCHAR(100) NOT NULL,
    "releaseDate" INTEGER NOT NULL,
    "votes" INTEGER,
    "duration" INTEGER,
    "type" VARCHAR(50) NOT NULL,
    "certificate" VARCHAR(20),
    "episodes" INTEGER,
    "nudity" VARCHAR(20),
    "violence" VARCHAR(20),
    "profanity" VARCHAR(20),
    "alcohol" VARCHAR(20),
    "frightening" VARCHAR(20),
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL DEFAULT 'Unknown',

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieGenre" (
    "movieId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "MovieGenre_pkey" PRIMARY KEY ("movieId","genreId")
);

-- CreateTable
CREATE TABLE "Rate" (
    "id" SERIAL NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "movieId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieGenre" ADD CONSTRAINT "MovieGenre_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieGenre" ADD CONSTRAINT "MovieGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
