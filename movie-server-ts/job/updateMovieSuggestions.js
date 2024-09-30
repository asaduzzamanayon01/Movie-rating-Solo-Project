const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function updateMovieSuggestions() {
  console.log("Starting movie suggestions update...");
  try {
    const movies = await prisma.movie.findMany({
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        ratings: true,
      },
    });

    for (const sourceMovie of movies) {
      for (const targetMovie of movies) {
        if (sourceMovie.id === targetMovie.id) continue;

        const matchingGenres = sourceMovie.genres.filter((sg) =>
          targetMovie.genres.some((tg) => tg.genreId === sg.genreId)
        );

        const categoryMatchCount = matchingGenres.length;
        const viewCount = await prisma.rate.count({
          where: { movieId: targetMovie.id },
        });
        const averageRating =
          targetMovie.ratings.length > 0
            ? targetMovie.ratings.reduce((sum, r) => sum + r.score, 0) /
              targetMovie.ratings.length
            : 0;

        await prisma.movieSuggestion.upsert({
          where: {
            sourceMovieId_suggestedMovieId: {
              sourceMovieId: sourceMovie.id,
              suggestedMovieId: targetMovie.id,
            },
          },
          update: {
            categoryMatchCount,
            viewCount,
            averageRating,
          },
          create: {
            sourceMovieId: sourceMovie.id,
            suggestedMovieId: targetMovie.id,
            categoryMatchCount,
            viewCount,
            averageRating,
          },
        });
      }
    }
    console.log("Movie suggestions update completed successfully.");
  } catch (error) {
    console.error("Error updating movie suggestions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = updateMovieSuggestions;

if (require.main === module) {
  updateMovieSuggestions();
}
