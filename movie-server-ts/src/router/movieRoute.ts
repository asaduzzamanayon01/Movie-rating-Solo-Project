import express, { RequestHandler } from "express";
import {
  getAllMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  addRating,
  getMovieById,
  getRelatedMovies,
  getAllGenres,
  // searchMovies,
} from "../controller/movieController";
import authMiddleware from "../authenticate/authenticate";

const movieRoute = express.Router();

// Use middleware and controllers directly without unnecessary casting
// movieRoute.get("/search", searchMovies);

movieRoute.get("/movies", getAllMovies);
movieRoute.get("/movie/:id", getMovieById);
movieRoute.post("/movie/create", authMiddleware, createMovie);
movieRoute.put("/movie/update/:id", authMiddleware, updateMovie);
movieRoute.delete("/movie/delete/:id", authMiddleware, deleteMovie);
movieRoute.get("/movies/related/:id", getRelatedMovies);

// For Rating
movieRoute.post("/movie-rate", authMiddleware, addRating);
movieRoute.get("/genres", getAllGenres);

export default movieRoute;
