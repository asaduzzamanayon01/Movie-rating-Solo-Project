-- CreateTable
CREATE TABLE "IpView" (
    "id" SERIAL NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieSuggestion" (
    "id" SERIAL NOT NULL,
    "ipViewId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IpView_ipAddress_key" ON "IpView"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "MovieSuggestion_ipViewId_movieId_key" ON "MovieSuggestion"("ipViewId", "movieId");

-- AddForeignKey
ALTER TABLE "MovieSuggestion" ADD CONSTRAINT "MovieSuggestion_ipViewId_fkey" FOREIGN KEY ("ipViewId") REFERENCES "IpView"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieSuggestion" ADD CONSTRAINT "MovieSuggestion_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
