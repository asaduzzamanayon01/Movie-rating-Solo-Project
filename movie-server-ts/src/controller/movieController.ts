import { Request, Response } from "express";
import prisma from "../DB/db.config";
import { generateRandom, imageValidator, removeImage } from "../utils/helper";
import { UploadedFile } from "express-fileupload";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../validation/userdataValidation";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { promises } from "dns";

// Authenticated request type to ensure TypeScript knows about req.user
interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string };
}

const ensureDirectoryExistence = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create Movie Controller
export const createMovie = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Validate the request body using the createMovieSchema
    const movieData = createMovieSchema.parse(req.body);

    // Check if the image file is provided
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const movieImage = req.files.image as UploadedFile;

    // Validate image size and type
    const validationMessages = imageValidator(
      movieImage.size,
      movieImage.mimetype
    );
    if (validationMessages !== null) {
      return res.status(400).json({ message: validationMessages });
    }

    // Generate a unique name for the image
    const imgExt = movieImage.name.split(".").pop();
    const imageName = `${generateRandom()}.${imgExt}`;
    const uploadPath = path.join(process.cwd(), "public", "images", imageName);

    // Ensure the directory exists and move the new image
    ensureDirectoryExistence(uploadPath);
    await new Promise<void>((resolve, reject) => {
      movieImage.mv(uploadPath, (err) => {
        if (err) {
          console.error("Error during file upload:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Get the user ID from the token (from req.user set by the authMiddleware)
    const userID = req.user?.id;
    if (!userID) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Create the movie entry in the database
    const movie = await prisma.movie.create({
      data: {
        title: movieData.title,
        image: imageName,
        releaseDate: movieData.releaseDate,
        type: movieData.type,
        certificate: movieData.certificate,
        createdBy: userID,
        genres: {
          create: movieData.genres.map((genreId: number) => ({
            genre: { connect: { id: genreId } }, // Connect the genres
          })),
        },
      },
    });

    return res.status(201).json({
      message: "Movie created successfully",
      movie,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors });
    }
    console.error("Error creating movie:", err);
    return res.status(500).json({ message: "Error creating movie" });
  }
};

// Fetch All Movies Controller
export const getAllMovies = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Fetch all movies from the database along with related data (genres, creator, ratings)
    const movies = await prisma.movie.findMany({
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

    // Format the response to be more user-friendly
    const formattedMovies = movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      image: `${process.env.APP_URL}/images/${movie.image}`, // Add full image URL
      releaseDate: movie.releaseDate,
      type: movie.type,
      certificate: movie.certificate,
      createdBy: `${movie.user.firstName} ${movie.user.lastName}`, // Full name of the user who created the movie
      genres: movie.genres.map((g) => g.genre.name), // List of genre names
      averageRating:
        movie.ratings.length > 0
          ? movie.ratings.reduce((acc, rating) => acc + rating.score, 0) /
            movie.ratings.length // Calculate average rating
          : null, // If no ratings, set it as null
    }));

    return res.json({
      message: "Movies fetched successfully",
      movies: formattedMovies,
    });
  } catch (err) {
    console.error("Error fetching movies:", err);
    return res.status(500).json({ message: "Error fetching movies" });
  }
};

// Update Movie Controller
export const updateMovie = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    // Validate the request body using the updateMovieSchema
    const movieData = updateMovieSchema.parse(req.body);

    // Check if the movie exists
    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(id) },
    });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    let imageName = movie.image; // Keep the current image by default

    // If an image is provided, validate and upload the new image
    if (req.files && req.files.image) {
      const movieImage = req.files.image as UploadedFile;

      // Validate the new image
      const validationMessages = imageValidator(
        movieImage.size,
        movieImage.mimetype
      );
      if (validationMessages !== null) {
        return res.status(400).json({ message: validationMessages });
      }

      // Generate a new image name and upload it
      const imgExt = movieImage.name.split(".").pop();
      imageName = `${generateRandom()}.${imgExt}`;
      const uploadPath = path.join(
        process.cwd(),
        "public",
        "images",
        imageName
      );

      // Ensure the directory exists and move the new image
      ensureDirectoryExistence(uploadPath);
      await new Promise<void>((resolve, reject) => {
        movieImage.mv(uploadPath, (err) => {
          if (err) {
            console.error("Error during file upload:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      // Remove the old image if a new one was uploaded
      if (movie.image) {
        removeImage(movie.image);
      }
    }

    // Update movie details in the database
    const updatedMovie = await prisma.movie.update({
      where: { id: parseInt(id) },
      data: {
        title: movieData.title || movie.title,
        image: imageName,
        releaseDate: movieData.releaseDate || movie.releaseDate,
        type: movieData.type || movie.type,
        certificate: movieData.certificate || movie.certificate,
        genres: movieData.genres
          ? {
              deleteMany: {},
              create: movieData.genres.map((genreId: number) => ({
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
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors });
    }
    console.error("Error updating movie:", err);
    return res.status(500).json({ message: "Error updating movie" });
  }
};

// Delete Movie Controller
export const deleteMovie = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    // Check if the movie exists
    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(id) },
    });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Remove the associated image from the server
    if (movie.image) {
      removeImage(movie.image);
    }

    // Delete the movie from the database
    await prisma.movie.delete({
      where: { id: parseInt(id) },
    });

    return res.json({ message: "Movie deleted successfully" });
  } catch (err) {
    console.error("Error deleting movie:", err);
    return res.status(500).json({ message: "Error deleting movie" });
  }
};

// Rateing movie
export const addRating = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { movieId, score } = req.body;
    const userId = req.user?.id; // Assuming user is authenticated and req.user is available

    // Validate if score is between 0 and 10
    if (score < 0 || score > 10) {
      return res.status(400).json({ error: "Score must be between 0 and 10." });
    }

    // Check if the user has already rated this movie
    const existingRating = await prisma.rate.findFirst({
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
      const newRating = await prisma.rate.create({
        data: {
          score,
          movieId,
          userId,
        },
      });
    } else {
      throw new Error("Login for rating...");
    }

    return res.status(201).json({ message: "Rated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while adding the rating." });
  }
};