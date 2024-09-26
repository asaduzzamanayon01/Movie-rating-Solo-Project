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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllGenres = exports.getRelatedMovies = exports.addRating = exports.deleteMovie = exports.updateMovie = exports.getMovieById = exports.getAllMovies = exports.createMovie = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const userdataValidation_1 = require("../validation/userdataValidation");
const zod_1 = require("zod");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const helper_1 = require("../utils/helper");
const db_config_1 = __importDefault(require("../DB/db.config"));
// Elasticsearch client setup
const esClient = new elasticsearch_1.Client({
    node: "https://localhost:9200/",
    auth: {
        username: "elastic",
        password: "I16omnzaK0sHB8mj4YEL",
    },
    tls: {
        rejectUnauthorized: false,
    },
});
const ensureDirectoryExistence = (filePath) => {
    const dir = path_1.default.dirname(filePath);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
// Create Movie Controller
const createMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const movieData = userdataValidation_1.createMovieSchema.parse(req.body);
        if (!req.files || !req.files.image) {
            return res.status(400).json({ message: "Image is required" });
        }
        const movieImage = req.files.image;
        const validationMessages = (0, helper_1.imageValidator)(movieImage.size, movieImage.mimetype);
        if (validationMessages !== null) {
            return res.status(400).json({ message: validationMessages });
        }
        const imgExt = movieImage.name.split(".").pop();
        const imageName = `${(0, helper_1.generateRandom)()}.${imgExt}`;
        const uploadPath = path_1.default.join(process.cwd(), "public", "images", imageName);
        ensureDirectoryExistence(uploadPath);
        yield new Promise((resolve, reject) => {
            movieImage.mv(uploadPath, (err) => {
                if (err) {
                    console.error("Error during file upload:", err);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
        const userID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userID) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log("Movie ganra from create form", movieData.genres);
        // Create the movie entry in the database
        const dbMovie = yield db_config_1.default.movie.create({
            data: {
                title: movieData.title,
                image: imageName,
                releaseDate: movieData.releaseDate,
                description: movieData.description,
                createdBy: userID,
                duration: movieData.duration,
                createdAt: new Date(),
                genres: {
                    create: movieData.genres.map((genreId) => ({
                        genre: { connect: { id: genreId } },
                    })),
                },
            },
            include: {
                genres: {
                    include: {
                        genre: true,
                    },
                },
            },
        });
        // Prepare the movie data for Elasticsearch
        const esMovie = {
            id: dbMovie.id,
            title: dbMovie.title,
            image: dbMovie.image,
            releaseDate: dbMovie.releaseDate,
            description: dbMovie.description,
            createdBy: dbMovie.createdBy,
            duration: dbMovie.duration,
            createdAt: new Date().toISOString(),
            genres: dbMovie.genres.map((g) => g.genre.name),
        };
        // Index the movie in Elasticsearch
        yield esClient.index({
            index: "movies",
            id: dbMovie.id.toString(),
            body: esMovie,
        });
        return res.status(201).json({
            message: "Movie created successfully",
            movie: esMovie,
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = (0, helper_1.formatError)(error);
            return res.status(422).json({ message: "Invalid data", errors });
        }
        else {
            console.error("Error in createMovie:", error);
            return res.status(500).json({ message: "Something went wrong" });
        }
    }
});
exports.createMovie = createMovie;
const getAllMovies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { page = "1", limit = "18", genre, user, query } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const from = (pageNumber - 1) * limitNumber;
    try {
        // Building the search query for ElasticSearch
        const searchQuery = {
            bool: {
                must: [],
            },
        };
        if (genre) {
            searchQuery.bool.must.push({
                term: { "genres.keyword": genre.toString() }, // This uses the correct keyword subfield
            });
        }
        // Filter by user if provided
        if (user) {
            searchQuery.bool.must.push({
                term: { createdBy: parseInt(user) },
            });
        }
        // Search by query in title or description
        if (query) {
            searchQuery.bool.must.push({
                multi_match: {
                    query: query,
                    fields: ["title", "description"],
                    fuzziness: "AUTO",
                },
            });
        }
        // Execute the search query
        const result = yield esClient.search({
            index: "movies",
            from,
            size: limitNumber,
            body: {
                query: searchQuery,
                sort: [{ createdAt: "desc" }],
            },
            track_total_hits: true,
        });
        const hits = result.hits.hits;
        const movieIds = hits.map((hit) => { var _a; return parseInt((_a = hit._id) !== null && _a !== void 0 ? _a : ""); });
        const averageRatings = yield db_config_1.default.rate.groupBy({
            by: ["movieId"],
            where: { movieId: { in: movieIds } },
            _avg: {
                score: true,
            },
        });
        const ratingMap = new Map(averageRatings.map((rating) => [rating.movieId, rating._avg.score]));
        // Format the movies to return
        const movies = result.hits.hits.map((hit) => {
            var _a, _b, _c;
            const source = hit._source;
            return {
                id: (_a = hit._id) !== null && _a !== void 0 ? _a : "",
                title: source.title,
                image: source.image && source.image.startsWith("http")
                    ? source.image
                    : source.image
                        ? `${process.env.APP_URL}/images/${source.image}`
                        : "default-image-url.jpg",
                releaseDate: source.releaseDate,
                description: source.description,
                createdBy: source.createdBy,
                genres: source.genres,
                averageRating: (_c = ratingMap.get(parseInt((_b = hit._id) !== null && _b !== void 0 ? _b : ""))) !== null && _c !== void 0 ? _c : null,
                duration: source.duration,
            };
        });
        // Check totalMovies (Elasticsearch might return it as an object)
        const totalMovies = typeof result.hits.total === "number"
            ? result.hits.total
            : ((_a = result.hits.total) === null || _a === void 0 ? void 0 : _a.value) || 0;
        return res.json({
            message: "Movies fetched successfully",
            movies,
            totalMovies,
        });
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return res
            .status(500)
            .json({ message: "Error fetching movies", error: errorMessage });
    }
});
exports.getAllMovies = getAllMovies;
const getMovieById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { id } = req.params;
    try {
        if (id) {
            const result = yield esClient.get({
                index: "movies",
                id: id,
            });
            if (!result.found) {
                return res.status(404).json({ message: "Movie not found" });
            }
            const averageRating = yield db_config_1.default.rate.aggregate({
                where: { movieId: parseInt(id) },
                _avg: { score: true },
            });
            const userID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const userRating = yield db_config_1.default.rate.findFirst({
                where: { movieId: parseInt(id), userId: userID },
            });
            const movie = result._source;
            // console.log("movie genres", movie.genres);
            const genreIdArray = yield db_config_1.default.genre
                .findMany({
                where: { name: { in: movie.genres } },
                select: { id: true },
            })
                .then((genres) => genres.map((genre) => genre.id.toString())); // Convert to
            const userName = yield db_config_1.default.user.findFirst({
                where: { id: userID },
            });
            const formattedMovie = {
                id: result._id,
                title: movie.title,
                image: movie.image
                    ? movie.image.startsWith("http")
                        ? movie.image
                        : `${process.env.APP_URL}/images/${movie.image}`
                    : "default-image-url.jpg",
                releaseDate: movie.releaseDate,
                description: movie.description,
                createdBy: userName === null || userName === void 0 ? void 0 : userName.firstName,
                genres: movie.genres,
                genreIds: genreIdArray,
                averageRating: (_b = averageRating._avg.score) !== null && _b !== void 0 ? _b : null,
                userRating: (_c = userRating === null || userRating === void 0 ? void 0 : userRating.score) !== null && _c !== void 0 ? _c : 0,
                duration: (_d = movie.duration) !== null && _d !== void 0 ? _d : null,
            };
            return res.json({
                message: "Movie",
                movie: formattedMovie,
            });
        }
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return res
            .status(500)
            .json({ message: "Error fetching movies", error: errorMessage });
    }
});
exports.getMovieById = getMovieById;
// Update Movie Controller
const updateMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const movieData = userdataValidation_1.updateMovieSchema.parse(req.body);
        // Check if the movie exists in the database
        const existingMovie = yield db_config_1.default.movie.findUnique({
            where: { id: parseInt(id) },
            include: { genres: { include: { genre: true } } },
        });
        if (!existingMovie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        let imageName = existingMovie.image || "default-image.jpg";
        // Handle image upload
        if (req.files && "image" in req.files) {
            const movieImage = req.files.image;
            const validationMessages = (0, helper_1.imageValidator)(movieImage.size, movieImage.mimetype);
            if (validationMessages !== null) {
                return res.status(400).json({ message: validationMessages });
            }
            const imgExt = movieImage.name.split(".").pop();
            imageName = `${(0, helper_1.generateRandom)()}.${imgExt}`;
            const uploadPath = path_1.default.join(process.cwd(), "public", "images", imageName);
            ensureDirectoryExistence(uploadPath);
            yield new Promise((resolve, reject) => {
                movieImage.mv(uploadPath, (err) => {
                    if (err) {
                        console.error("Error during file upload:", err);
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
            if (existingMovie.image && existingMovie.image !== "default-image.jpg") {
                (0, helper_1.removeImage)(existingMovie.image);
            }
        }
        const updatedMovie = yield db_config_1.default.movie.update({
            where: { id: parseInt(id) },
            data: {
                title: movieData.title || existingMovie.title,
                image: imageName,
                releaseDate: movieData.releaseDate || existingMovie.releaseDate,
                duration: movieData.duration || existingMovie.duration,
                description: movieData.description || existingMovie.description,
                createdAt: new Date(),
                genres: {
                    deleteMany: {},
                    create: movieData.genres.map((genreId) => ({
                        genre: { connect: { id: genreId } },
                    })),
                },
            },
            include: { genres: { include: { genre: true } } },
        });
        // Fetch the updated movie with genres
        const movieWithGenres = yield db_config_1.default.movie.findUnique({
            where: { id: parseInt(id) },
            include: { genres: { include: { genre: true } } },
        });
        if (!movieWithGenres) {
            return res.status(404).json({ message: "Updated movie not found" });
        }
        // Prepare data for Elasticsearch
        const elasticsearchMovie = {
            title: movieWithGenres.title,
            image: movieWithGenres.image,
            releaseDate: movieWithGenres.releaseDate || 0,
            description: movieWithGenres.description || "",
            createdBy: movieWithGenres.createdBy,
            genres: movieWithGenres.genres.map((g) => g.genre.name),
            averageRating: null, // Assuming this is not updated here
            duration: movieWithGenres.duration,
            createdAt: new Date().toISOString(),
        };
        // Update movie in Elasticsearch
        yield esClient.update({
            index: "movies",
            id: id,
            body: {
                doc: elasticsearchMovie,
            },
        });
        // Prepare the response with genres
        const responseMovie = Object.assign(Object.assign({}, movieWithGenres), { genres: movieWithGenres.genres.map((g) => g.genre) });
        return res.json({
            message: "Movie updated successfully in database and Elasticsearch",
            movie: updatedMovie,
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = (0, helper_1.formatError)(error);
            return res.status(422).json({ message: "Invalid data", errors });
        }
        else {
            console.error("Error updating movie:", error);
            return res.status(500).json({ message: "Something went wrong" });
        }
    }
});
exports.updateMovie = updateMovie;
const deleteMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const existingMovie = yield esClient.get({
            index: "movies",
            id: id,
        });
        if (!existingMovie.found) {
            return res.status(404).json({ message: "Movie not found" });
        }
        const existingMovieSource = existingMovie._source;
        if (existingMovieSource.image &&
            existingMovieSource.image !== "default-image.jpg") {
            (0, helper_1.removeImage)(existingMovieSource.image);
        }
        yield esClient.delete({
            index: "movies",
            id: id,
        });
        return res.json({ message: "Movie deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting movie:", err);
        return res
            .status(500)
            .json({ message: "Error deleting movie", error: err.message });
    }
});
exports.deleteMovie = deleteMovie;
// Rating movie
const addRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { movieId, score } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (score < 0 || score > 5) {
            return res.status(400).json({ error: "Score must be between 0 and 5." });
        }
        if (!userId) {
            return res.status(401).json({ error: "Login required for rating." });
        }
        const existingRating = yield db_config_1.default.rate.findFirst({
            where: {
                userId: userId,
                movieId: parseInt(movieId),
            },
        });
        if (existingRating) {
            return res
                .status(400)
                .json({ error: "You have already rated this movie." });
        }
        yield db_config_1.default.rate.create({
            data: {
                score,
                movieId: parseInt(movieId),
                userId,
            },
        });
        return res.status(201).json({ message: "Rated successfully" });
    }
    catch (error) {
        console.error("Error adding rating:", error);
        return res
            .status(500)
            .json({ error: "An error occurred while adding the rating." });
    }
});
exports.addRating = addRating;
const getRelatedMovies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const ipAddress = req.ip;
    try {
        // Fetch the movie from Elasticsearch
        const movieResult = yield esClient.get({
            index: "movies",
            id: id,
        });
        if (!movieResult.found) {
            res.status(404).json({ message: "Movie not found" });
            return;
        }
        const movie = movieResult._source;
        const genres = movie.genres;
        const categories = movie.categories || []; // Assuming you've added categories to your Elasticsearch documents
        // Record the view in Prisma
        const ipView = yield db_config_1.default.ipView.upsert({
            where: { ipAddress },
            update: {},
            create: { ipAddress },
        });
        yield db_config_1.default.movieSuggestion.upsert({
            where: {
                ipViewId_movieId: {
                    ipViewId: ipView.id,
                    movieId: parseInt(id),
                },
            },
            update: {
                viewCount: { increment: 1 },
            },
            create: {
                ipViewId: ipView.id,
                movieId: parseInt(id),
                viewCount: 1,
            },
        });
        // Fetch related movies using Elasticsearch
        const result = yield esClient.search({
            index: "movies",
            body: {
                query: {
                    bool: {
                        should: [
                            { match: { title: { query: movie.title, boost: 2 } } },
                            { terms: { "categories.keyword": categories, boost: 1.5 } },
                            { terms: { "genres.keyword": genres } },
                        ],
                        must_not: [{ term: { _id: id } }],
                    },
                },
                sort: [{ _score: "desc" }, { releaseDate: "desc" }],
                size: 6,
            },
        });
        // Format the response
        const relatedMovies = result.hits.hits.map((hit) => ({
            id: hit._id,
            title: hit._source.title,
            image: hit._source.image.startsWith("http")
                ? hit._source.image
                : `${process.env.APP_URL}/images/${hit._source.image}`,
            releaseDate: hit._source.releaseDate,
            description: hit._source.description,
            categories: hit._source.categories || [],
            genres: hit._source.genres || [],
        }));
        // Fetch view counts for the related movies from Prisma
        const movieIds = relatedMovies.map((movie) => parseInt(movie.id));
        const viewCounts = yield db_config_1.default.movieSuggestion.groupBy({
            by: ["movieId"],
            where: {
                movieId: {
                    in: movieIds,
                },
            },
            _sum: {
                viewCount: true,
            },
        });
        // Create a map of movie ID to view count
        const viewCountMap = new Map(viewCounts.map((vc) => [vc.movieId, vc._sum.viewCount || 0]));
        // Add view counts to the related movies
        const relatedMoviesWithViews = relatedMovies.map((movie) => (Object.assign(Object.assign({}, movie), { viewCount: viewCountMap.get(parseInt(movie.id)) || 0 })));
        // Fetch all unique categories from the related movies
        const allCategories = Array.from(new Set(relatedMoviesWithViews.flatMap((movie) => movie.categories)));
        res.status(200).json({
            movies: relatedMoviesWithViews,
            allCategories: allCategories,
        });
    }
    catch (error) {
        console.error("Error fetching related movies:", error);
        res.status(500).json({ message: "Error fetching related movies" });
    }
});
exports.getRelatedMovies = getRelatedMovies;
const getAllGenres = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const genres = yield db_config_1.default.genre.findMany();
        return res.status(200).json(genres);
    }
    catch (error) {
        console.error("Error fetching genres:", error);
        return res.status(500).json({ message: "Error fetching genres" });
    }
});
exports.getAllGenres = getAllGenres;
