"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const faker_1 = require("@faker-js/faker");
const prisma = new client_1.PrismaClient();
const seedMovies = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userIds = [1];
        const genreIds = Array.from({ length: 15 }, (_, i) => i + 1); // Genre IDs from 1 to 15
        const moviesToInsert = [];
        const batchSize = 10; // Adjust batch size as needed
        for (let i = 0; i < 300; i++) {
            const movieData = {
                title: `${faker_1.faker.word.adjective()} ${faker_1.faker.word.noun()} ${faker_1.faker.number.int({ min: 1, max: 5 })}`,
                image: `https://picsum.photos/seed/movie-${i + 1}-${faker_1.faker.string.alphanumeric(5)}/400/600`,
                description: faker_1.faker.lorem.paragraph(),
                releaseDate: faker_1.faker.date.past().getFullYear(),
                duration: Math.floor(Math.random() * 180) + 60, // Random duration between 60 and 240 minutes
                createdBy: userIds[Math.floor(Math.random() * userIds.length)], // Randomly select a user ID
            };
            moviesToInsert.push(movieData);
            // Insert in batches
            if (i > 0 && i % batchSize === 0) {
                const insertedMovies = yield prisma.movie.createMany({
                    data: moviesToInsert,
                });
                console.log(`Inserted batch of ${batchSize} movies.`);
                moviesToInsert.length = 0; // Reset array
                // Generate random genres for the inserted movies
                const latestMovies = yield prisma.movie.findMany({
                    take: batchSize,
                    orderBy: { id: "desc" },
                });
                for (const movie of latestMovies) {
                    const randomGenreCount = Math.floor(Math.random() * 4) + 2; // 2 to 5 random genres
                    const randomGenreIds = faker_1.faker.helpers
                        .shuffle(genreIds)
                        .slice(0, randomGenreCount);
                    yield prisma.movieGenre.createMany({
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
            const insertedMovies = yield prisma.movie.createMany({
                data: moviesToInsert,
            });
            console.log(`Inserted final batch of ${moviesToInsert.length} movies.`);
            // Generate random genres for the remaining movies
            const latestMovies = yield prisma.movie.findMany({
                take: moviesToInsert.length,
                orderBy: { id: "desc" },
            });
            for (const movie of latestMovies) {
                const randomGenreCount = Math.floor(Math.random() * 4) + 2; // 2 to 5 random genres
                const randomGenreIds = faker_1.faker.helpers
                    .shuffle(genreIds)
                    .slice(0, randomGenreCount);
                yield prisma.movieGenre.createMany({
                    data: randomGenreIds.map((genreId) => ({
                        movieId: movie.id,
                        genreId: genreId,
                    })),
                });
            }
        }
        console.log("Seeding completed.");
    }
    catch (error) {
        console.error("Error seeding movies:", error);
    }
    finally {
        yield prisma.$disconnect(); // Ensure you close the connection
    }
});
seedMovies();
