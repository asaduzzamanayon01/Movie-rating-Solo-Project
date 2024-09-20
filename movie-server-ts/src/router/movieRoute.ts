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
  searchMovies,
} from "../controller/movieController";
import authMiddleware from "../authenticate/authenticate";

const movieRoute = express.Router();

// Use middleware and controllers directly without unnecessary casting
movieRoute.get("/all-movies", getAllMovies);
movieRoute.get("/movie-detail/:id", getMovieById);
movieRoute.get("/all-genre", getAllGenres);
movieRoute.get("/search", searchMovies);
movieRoute.post("/create-movie", authMiddleware, createMovie);
movieRoute.put("/update-movie/:id", authMiddleware, updateMovie);
movieRoute.delete("/delete-movie/:id", authMiddleware, deleteMovie);
movieRoute.get("/related-movies/:id", getRelatedMovies);

// For Rating
movieRoute.post("/movie-rate", authMiddleware, addRating);

export default movieRoute;
