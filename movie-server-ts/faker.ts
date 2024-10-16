import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const seedMovies = async (): Promise<void> => {
  try {
    const userIds = [1];
    const genreIds = Array.from({ length: 15 }, (_, i) => i + 1); // Genre IDs from 1 to 15

    const moviesToInsert = [];
    const batchSize = 100; // Adjust batch size as needed

    for (let i = 0; i < 500; i++) {
      const movieData = {
        title: `${faker.word.adjective()} ${faker.word.noun()} ${faker.number.int(
          { min: 1, max: 5 }
        )}`,
        image: `https://picsum.photos/seed/movie-${
          i + 1
        }-${faker.string.alphanumeric(5)}/400/600`,
        description: faker.lorem.paragraph(),
        releaseDate: faker.date.past().getFullYear(),
        duration: Math.floor(Math.random() * 180) + 60, // Random duration between 60 and 240 minutes
        createdBy: userIds[Math.floor(Math.random() * userIds.length)], // Randomly select a user ID
      };

      moviesToInsert.push(movieData);

      // Insert in batches
      if (i > 0 && i % batchSize === 0) {
        const insertedMovies = await prisma.movie.createMany({
          data: moviesToInsert,
        });
        console.log(`Inserted batch of ${batchSize} movies.`);
        moviesToInsert.length = 0; // Reset array

        // Generate random genres for the inserted movies
        const latestMovies = await prisma.movie.findMany({
          take: batchSize,
          orderBy: { id: "desc" },
        });

        for (const movie of latestMovies) {
          const randomGenreCount = Math.floor(Math.random() * 4) + 2; // 2 to 5 random genres
          const randomGenreIds = faker.helpers
            .shuffle(genreIds)
            .slice(0, randomGenreCount);

          await prisma.movieGenre.createMany({
            data: randomGenreIds.map((genreId) => ({
              movieId: movie.id,
              genreId: genreId,
            })),
          });
        }
      }
    }

    // Insert any remaining movies
    if (moviesToInsert.length) {
      const insertedMovies = await prisma.movie.createMany({
        data: moviesToInsert,
      });
      console.log(`Inserted final batch of ${moviesToInsert.length} movies.`);

      // Generate random genres for the remaining movies
      const latestMovies = await prisma.movie.findMany({
        take: moviesToInsert.length,
        orderBy: { id: "desc" },
      });

      for (const movie of latestMovies) {
        const randomGenreCount = Math.floor(Math.random() * 4) + 2; // 2 to 5 random genres
        const randomGenreIds = faker.helpers
          .shuffle(genreIds)
          .slice(0, randomGenreCount);

        await prisma.movieGenre.createMany({
          data: randomGenreIds.map((genreId) => ({
            movieId: movie.id,
            genreId: genreId,
          })),
        });
      }
    }

    console.log("Seeding completed.");
  } catch (error) {
    console.error("Error seeding movies:", error);
  } finally {
    await prisma.$disconnect(); // Ensure you close the connection
  }
};

seedMovies();
