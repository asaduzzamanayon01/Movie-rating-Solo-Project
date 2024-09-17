import express, { RequestHandler } from "express";
import {
  getAllMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  addRating,
} from "../controller/movieController";
import authMiddleware from "../authenticate/authenticate";

const movieRoute = express.Router();

// Use middleware and controllers directly without unnecessary casting
movieRoute.get("/all-movies", getAllMovies);
movieRoute.post("/create-movie", authMiddleware, createMovie);
movieRoute.put("/update-movie/:id", authMiddleware, updateMovie);
movieRoute.delete("/delete-movie/:id", authMiddleware, deleteMovie);

// For Rating
movieRoute.post("/movie-rate", authMiddleware, addRating);

export default movieRoute;
