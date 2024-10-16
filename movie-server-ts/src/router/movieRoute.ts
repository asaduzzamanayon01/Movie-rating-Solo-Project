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
movieRoute.post("/movie", authMiddleware, createMovie);
movieRoute.put("/movie/:id", authMiddleware, updateMovie);
movieRoute.delete("/movie/:id", authMiddleware, deleteMovie);
movieRoute.get("/movies/:id/related", getRelatedMovies);

// For Rating
movieRoute.post("/movie-rate", authMiddleware, addRating);
movieRoute.get("/genres", getAllGenres);

//For comment
// movieRoute.post("/comments", authMiddleware, addComment);
// movieRoute.put("/comments/:id", authMiddleware, updateComment);
// movieRoute.delete("/comments/:id", authMiddleware, deleteComment);
// movieRoute.get("/comments/:movieId", getComments);

export default movieRoute;
