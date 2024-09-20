"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const path = __importStar(require("path"));
const prisma = new client_1.PrismaClient();
const csvFilePath = path.join(__dirname, "../src/movie.csv");
// Provide a default user ID for the movies (replace with actual user ID from your database)
const DEFAULT_USER_ID = 1;
const movies = [];
fs_1.default.createReadStream(csvFilePath) // Replace with the correct path to your CSV file
    .pipe((0, csv_parser_1.default)())
    .on("data", (data) => {
    movies.push({
        Poster_Link: data.Poster_Link,
        Series_Title: data.Series_Title,
        Released_Year: data.Released_Year,
        Runtime: data.Runtime,
        Genre: data.Genre,
        Overview: data.Overview,
    });
})
    .on("end", () => __awaiter(void 0, void 0, void 0, function* () {
    for (const movie of movies) {
        try {
            // Parse the runtime (e.g., "142 min" -> 142)
            const duration = parseInt(movie.Runtime.split(" ")[0]);
            // Parse release year
            const releaseDate = parseInt(movie.Released_Year);
            // Handle genres
            const genreNames = movie.Genre.split(", ").map((genre) => genre.trim());
            const genres = yield Promise.all(genreNames.map((genreName) => __awaiter(void 0, void 0, void 0, function* () {
                // Find or create the genre
                return yield prisma.genre.upsert({
                    where: { name: genreName },
                    update: {},
                    create: { name: genreName },
                });
            })));
            // Insert movie
            const createdMovie = yield prisma.movie.create({
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
        }
        catch (error) {
            console.error(`Error inserting movie: ${movie.Series_Title}`, error);
        }
    }
    console.log("Movie migration completed.");
    yield prisma.$disconnect();
}));
