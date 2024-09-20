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
exports.searchMovies = exports.getAllGenres = exports.getRelatedMovies = exports.getMovieById = exports.addRating = exports.deleteMovie = exports.updateMovie = exports.getAllMovies = exports.createMovie = void 0;
const db_config_1 = __importDefault(require("../DB/db.config"));
const helper_1 = require("../utils/helper");
const userdataValidation_1 = require("../validation/userdataValidation");
const zod_1 = require("zod");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
        // Validate the request body using the createMovieSchema
        const movieData = userdataValidation_1.createMovieSchema.parse(req.body);
        // Check if the image file is provided
        if (!req.files || !req.files.image) {
            return res.status(400).json({ message: "Image is required" });
        }
        const movieImage = req.files.image;
        // Validate image size and type
        const validationMessages = (0, helper_1.imageValidator)(movieImage.size, movieImage.mimetype);
        if (validationMessages !== null) {
            return res.status(400).json({ message: validationMessages });
        }
        // Generate a unique name for the image
        const imgExt = movieImage.name.split(".").pop();
        const imageName = `${(0, helper_1.generateRandom)()}.${imgExt}`;
        const uploadPath = path_1.default.join(process.cwd(), "public", "images", imageName);
        // Ensure the directory exists and move the new image
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
        // Get the user ID from the token (from req.user set by the authMiddleware)
        const userID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userID) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Create the movie entry in the database
        const movie = yield db_config_1.default.movie.create({
            data: {
                title: movieData.title,
                image: imageName,
                releaseDate: movieData.releaseDate,
                description: movieData.description,
                createdBy: userID,
                genres: {
                    create: movieData.genres.map((genreId) => ({
                        genre: { connect: { id: genreId } }, // Connect the genres
                    })),
                },
            },
        });
        return res.status(201).json({
            message: "Movie created successfully",
            movie,
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = (0, helper_1.formatError)(error);
            return res.status(422).json({ message: "Invalid data", errors });
        }
        else {
            return res.status(500).json({ message: "Something wrong" });
        }
    }
});
exports.createMovie = createMovie;
// Fetch All Movies Controller
const getAllMovies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 18, genre, user } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    try {
        // Create a filter object for genre if provided
        const genreFilter = genre
            ? {
                genres: {
                    some: {
                        genreId: parseInt(genre),
                    },
                },
            }
            : {}; // No genre filter if not provided
        // Create a filter for userId if provided
        const userIdFilter = user
            ? {
                createdBy: parseInt(user), // Filter by userId
            }
            : {}; // No user filter if not provided
        // Combine the filters
        const combinedFilters = Object.assign(Object.assign({}, genreFilter), userIdFilter);
        // Fetch movies with pagination, optional genre filter, and optional user filter
        const movies = yield db_config_1.default.movie.findMany({
            skip: skip,
            take: limitNumber,
            where: combinedFilters,
            orderBy: {
                id: "desc",
            },
            include: {
                genres: {
                    select: {
                        genre: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                ratings: {
                    select: {
                        score: true,
                    },
                },
            },
        });
        const totalMovies = yield db_config_1.default.movie.count({
            where: combinedFilters,
        });
        // Format the response
        const formattedMovies = movies.map((movie) => ({
            id: movie.id,
            title: movie.title,
            image: movie.image.startsWith("http")
                ? movie.image
                : `${process.env.APP_URL}/images/${movie.image}`,
            releaseDate: movie.releaseDate,
            averageRating: movie.ratings.length > 0
                ? movie.ratings.reduce((acc, rating) => acc + rating.score, 0) /
                    movie.ratings.length
                : null,
        }));
        return res.json({
            message: "Movies fetched successfully",
            movies: formattedMovies,
            totalMovies,
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Error fetching movies" });
    }
});
exports.getAllMovies = getAllMovies;
// Update Movie Controller
const updateMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Validate the request body using the updateMovieSchema
        const movieData = userdataValidation_1.updateMovieSchema.parse(req.body);
        // Check if the movie exists
        const movie = yield db_config_1.default.movie.findUnique({
            where: { id: parseInt(id) },
        });
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        let imageName = movie.image; // Keep the current image by default
        // If an image is provided, validate and upload the new image
        if (req.files && req.files.image) {
            const movieImage = req.files.image;
            // Validate the new image
            const validationMessages = (0, helper_1.imageValidator)(movieImage.size, movieImage.mimetype);
            if (validationMessages !== null) {
                return res.status(400).json({ message: validationMessages });
            }
            // Generate a new image name and upload it
            const imgExt = movieImage.name.split(".").pop();
            imageName = `${(0, helper_1.generateRandom)()}.${imgExt}`;
            const uploadPath = path_1.default.join(process.cwd(), "public", "images", imageName);
            // Ensure the directory exists and move the new image
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
            // Remove the old image if a new one was uploaded
            if (movie.image) {
                (0, helper_1.removeImage)(movie.image);
            }
        }
        // Update movie details in the database
        const updatedMovie = yield db_config_1.default.movie.update({
            where: { id: parseInt(id) },
            data: {
                title: movieData.title || movie.title,
                image: imageName,
                releaseDate: movieData.releaseDate || movie.releaseDate,
                genres: movieData.genres
                    ? {
                        deleteMany: {},
                        create: movieData.genres.map((genreId) => ({
                            genre: { connect: { id: genreId } },
                        })),
                    }
                    : undefined,
            },
        });
        return res.json({
            message: "Movie updated successfully",
            movie: updatedMovie,
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = (0, helper_1.formatError)(error);
            return res.status(422).json({ message: "Invalid data", errors });
        }
        else {
            return res.status(500).json({ message: "Something wrong" });
        }
    }
});
exports.updateMovie = updateMovie;
const deleteMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Check if the id is a valid number
        const movieId = parseInt(id);
        if (isNaN(movieId)) {
            return res.status(400).json({ message: "Invalid movie ID" });
        }
        // Check if the movie exists
        const movie = yield db_config_1.default.movie.findUnique({
            where: { id: movieId },
        });
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        // Remove the associated image from the server
        if (movie.image) {
            (0, helper_1.removeImage)(movie.image);
        }
        // Delete the movie from the database
        yield db_config_1.default.movie.delete({
            where: { id: movieId },
        });
        return res.json({ message: "Movie deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting movie:", err); // Log the error for debugging
        return res
            .status(500)
            .json({ message: "Error deleting movie", error: err.message });
    }
});
exports.deleteMovie = deleteMovie;
// Rateing movie
const addRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { movieId, score } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming user is authenticated and req.user is available
        // Validate if score is between 0 and 10
        if (score < 0 || score > 5) {
            return res.status(400).json({ error: "Score must be between 0 and 5." });
        }
        // Check if the user has already rated this movie
        const existingRating = yield db_config_1.default.rate.findFirst({
            where: {
                userId: userId,
                movieId: movieId,
            },
        });
        if (existingRating) {
            return res
                .status(400)
                .json({ error: "You have already rated this movie." });
        }
        if (userId !== undefined) {
            // If not rated, create a new rating
            const newRating = yield db_config_1.default.rate.create({
                data: {
                    score,
                    movieId,
                    userId,
                },
            });
        }
        else {
            throw new Error("Login for rating...");
        }
        return res.status(201).json({ message: "Rated successfully" });
    }
    catch (error) {
        return res
            .status(500)
            .json({ error: "An error occurred while adding the rating." });
    }
});
exports.addRating = addRating;
// Fetch Movie by ID Controller
const getMovieById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Fetch the movie from the database by its ID, along with related genres, creator, and ratings
        const movie = yield db_config_1.default.movie.findUnique({
            where: { id: parseInt(id) },
            include: {
                genres: {
                    select: {
                        genre: true, // Include genre details
                    },
                },
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true, // Include movie creator details
                    },
                },
                ratings: {
                    select: {
                        score: true, // Include ratings
                    },
                },
            },
        });
        // Check if the movie exists
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        // Format the movie response
        const formattedMovie = {
            id: movie.id,
            title: movie.title,
            image: movie.image.startsWith("http")
                ? movie.image
                : `${process.env.APP_URL}/images/${movie.image}`,
            releaseDate: movie.releaseDate,
            description: movie.description,
            createdBy: `${movie.user.firstName} ${movie.user.lastName}`,
            genres: movie.genres.map((g) => ({
                id: g.genre.id,
                name: g.genre.name,
            })),
            averageRating: movie.ratings.length > 0
                ? movie.ratings.reduce((acc, rating) => acc + rating.score, 0) /
                    movie.ratings.length
                : null,
        };
        return res.json({
            message: "Movie fetched successfully",
            movie: formattedMovie,
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Error fetching movie" });
    }
});
exports.getMovieById = getMovieById;
const getRelatedMovies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Fetch the movie with its genres
        const movie = yield db_config_1.default.movie.findUnique({
            where: { id: parseInt(id) },
            include: {
                genres: {
                    select: {
                        genreId: true, // Get genre IDs of the movie
                    },
                },
            },
        });
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        // Get genre IDs from the current movie
        const genreIds = movie.genres.map((g) => g.genreId);
        // Fetch related movies that share at least one genre
        const relatedMovies = yield db_config_1.default.movie.findMany({
            where: {
                id: {
                    not: movie.id, // Exclude the current movie
                },
                genres: {
                    some: {
                        genreId: {
                            in: genreIds, // Find movies that have at least one matching genre
                        },
                    },
                },
            },
            include: {
                genres: {
                    select: {
                        genre: true, // Include genre details
                    },
                },
            },
            take: 5, // Limit to 5 related movies
        });
        // Format the response
        const movies = relatedMovies.map((movie) => ({
            id: movie.id,
            title: movie.title,
            image: movie.image.startsWith("http")
                ? movie.image
                : `${process.env.APP_URL}/images/${movie.image}`,
            releaseDate: movie.releaseDate,
            genres: movie.genres.map((g) => g.genre.name),
        }));
        return res.status(200).json({
            movies,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching related movies" });
    }
});
exports.getRelatedMovies = getRelatedMovies;
const getAllGenres = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const genres = yield db_config_1.default.genre.findMany(); // Fetch all genres from the Genre table
        return res.status(200).json(genres);
    }
    catch (error) {
        console.error("Error fetching genres:", error);
        return res.status(500).json({ message: "Error fetching genres" });
    }
});
exports.getAllGenres = getAllGenres;
// Search Movies Controller
const searchMovies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Search query is required" });
    }
    try {
        // Fetch movies that contain the query string (case-insensitive)
        const movies = yield db_config_1.default.movie.findMany({
            where: {
                title: {
                    contains: query,
                    mode: "insensitive", // Case-insensitive search
                },
            },
            include: {
                genres: {
                    select: {
                        genre: true, // Include genre details
                    },
                },
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true, // Include movie creator details
                    },
                },
                ratings: {
                    select: {
                        score: true, // Include ratings
                    },
                },
            },
        });
        if (movies.length === 0) {
            return res.status(404).json({ message: "No movies found" });
        }
        // Format the response
        const formattedMovies = movies.map((movie) => ({
            id: movie.id,
            title: movie.title,
            image: movie.image.startsWith("http")
                ? movie.image
                : `${process.env.APP_URL}/images/${movie.image}`,
            releaseDate: movie.releaseDate,
            averageRating: movie.ratings.length > 0
                ? movie.ratings.reduce((acc, rating) => acc + rating.score, 0) /
                    movie.ratings.length
                : null,
            genres: movie.genres.map((g) => g.genre.name),
        }));
        return res.status(200).json({
            message: "Movies found successfully",
            movies: formattedMovies,
        });
    }
    catch (err) {
        console.error("Error during movie search:", err);
        return res.status(500).json({ message: "Error searching movies" });
    }
});
exports.searchMovies = searchMovies;
