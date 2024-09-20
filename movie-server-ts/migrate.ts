import { PrismaClient } from "@prisma/client";
import csv from "csv-parser";
import fs from "fs";
import * as path from "path";
const prisma = new PrismaClient();
const csvFilePath = path.join(__dirname, "./movie.csv");

// Provide a default user ID for the movies (replace with actual user ID from your database)
const DEFAULT_USER_ID = 1;

interface CsvMovie {
  Poster_Link: string;
  Series_Title: string;
  Released_Year: string;
  Runtime: string;
  Genre: string;
  Overview: string;
}

const movies: CsvMovie[] = [];

fs.createReadStream(csvFilePath) // Replace with the correct path to your CSV file
  .pipe(csv())
  .on("data", (data) => {
    console.log("Parsed data:", data); // Log the parsed data for debugging
    movies.push({
      Poster_Link: data.Poster_Link,
      Series_Title: data.Series_Title,
      Released_Year: data.Released_Year,
      Runtime: data.Runtime,
      Genre: data.Genre,
      Overview: data.Overview,
    });
  })
  .on("end", async () => {
    for (const movie of movies) {
      try {
        // Check if Runtime and Released_Year are defined
        if (!movie.Runtime || !movie.Released_Year) {
          console.error(`Missing data for movie: ${movie.Series_Title}`);
          continue;
        }

        // Parse the runtime (e.g., "142 min" -> 142)
        const duration = parseInt(movie.Runtime.split(" ")[0]);

        // Parse release year
        const releaseDate = parseInt(movie.Released_Year);

        // Handle genres
        const genreNames = movie.Genre.split(", ").map((genre) => genre.trim());
        const genres = await Promise.all(
          genreNames.map(async (genreName) => {
            // Find or create the genre
            return await prisma.genre.upsert({
              where: { name: genreName },
              update: {},
              create: { name: genreName },
            });
          })
        );

        // Insert movie
        const createdMovie = await prisma.movie.create({
          data: {
            title: movie.Series_Title,
            image: movie.Poster_Link,
            description: movie.Overview,
            releaseDate,
            duration,
            createdBy: DEFAULT_USER_ID,
            genres: {
              create: genres.map((genre) => ({
                genreId: genre.id,
              })),
            },
          },
        });

        console.log(`Movie inserted: ${createdMovie.title}`);
      } catch (error) {
        console.error(`Error inserting movie: ${movie.Series_Title}`, error);
      }
    }

    console.log("Movie migration completed.");
    await prisma.$disconnect();
  });
