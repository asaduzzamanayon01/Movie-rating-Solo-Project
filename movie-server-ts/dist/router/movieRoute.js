"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const movieController_1 = require("../controller/movieController");
const authenticate_1 = __importDefault(require("../authenticate/authenticate"));
const movieRoute = express_1.default.Router();
// Use middleware and controllers directly without unnecessary casting
// movieRoute.get("/search", searchMovies);
movieRoute.get("/movies", movieController_1.getAllMovies);
movieRoute.get("/movie/:id", movieController_1.getMovieById);
movieRoute.post("/movie/create", authenticate_1.default, movieController_1.createMovie);
movieRoute.put("/movie/update/:id", authenticate_1.default, movieController_1.updateMovie);
movieRoute.delete("/movie/delete/:id", authenticate_1.default, movieController_1.deleteMovie);
movieRoute.get("/movies/related/:id", movieController_1.getRelatedMovies);
// For Rating
movieRoute.post("/movie-rate", authenticate_1.default, movieController_1.addRating);
movieRoute.get("/genres", movieController_1.getAllGenres);
exports.default = movieRoute;
