import { Request, Response } from "express";
import { Client as ElasticsearchClient } from "@elastic/elasticsearch";
import { UploadedFile } from "express-fileupload";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../validation/userdataValidation";
import { z, ZodError } from "zod";
import fs from "fs";
import path from "path";
import {
  formatError,
  generateRandom,
  imageValidator,
  removeImage,
} from "../utils/helper";
import prisma from "../DB/db.config";
import { ParsedQs } from "qs";

// Type declarations
type User = {
  id: number;
  email: string;
};

type AuthenticatedRequest = Request & {
  user?: User;
};

type MovieData = {
  title: string;
  image?: string;
  releaseDate: number;
  description: string;
  createdBy?: number;
  genres: number[];
  duration?: number;
  genreIds?: number[];
};

type ElasticsearchMovie = {
  title: string;
  image: string | null;
  releaseDate: number;
  description: string;
  createdBy: number;
  genres: string[];
  averageRating: number | null;
  duration: number | null;
  createdAt: string;
};

type FormattedMovie = {
  id: string;
  title: string;
  image: string;
  releaseDate: number;
  description: string;
  createdBy: number;
  genres: number[];
  genreIds?: number[] | string[];
  averageRating: number | null;
  duration: number | null;
};

type SearchQuery = {
  bool: {
    must: Array<{
      term?: { [key: string]: string | number };
      multi_match?: {
        query: string;
        fields: string[];
      };
    }>;
  };
};

// Elasticsearch client setup
const esClient: ElasticsearchClient = new ElasticsearchClient({
  node: "https://localhost:9200/",
  auth: {
    username: "elastic",
    password: "I16omnzaK0sHB8mj4YEL",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const ensureDirectoryExistence = (filePath: string): void => {
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
    const movieData: MovieData = createMovieSchema.parse(req.body);

    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const movieImage = req.files.image as UploadedFile;

    const validationMessages: string | null = imageValidator(
      movieImage.size,
      movieImage.mimetype
    );
    if (validationMessages !== null) {
      return res.status(400).json({ message: validationMessages });
    }

    const imgExt: string | undefined = movieImage.name.split(".").pop();
    const imageName: string = `${generateRandom()}.${imgExt}`;
    const uploadPath: string = path.join(
      process.cwd(),
      "public",
      "images",
      imageName
    );

    ensureDirectoryExistence(uploadPath);
    await new Promise<void>((resolve, reject) => {
      movieImage.mv(uploadPath, (err: Error | null) => {
        if (err) {
          console.error("Error during file upload:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    const userID: number | undefined = req.user?.id;
    if (!userID) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("Movie ganra from create form", movieData.genres);
    // Create the movie entry in the database
    const dbMovie = await prisma.movie.create({
      data: {
        title: movieData.title,
        image: imageName,
        releaseDate: movieData.releaseDate,
        description: movieData.description,
        createdBy: userID,
        duration: movieData.duration,
        createdAt: new Date(),
        genres: {
          create: movieData.genres.map((genreId: number) => ({
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
    await esClient.index({
      index: "movies",
      id: dbMovie.id.toString(),
      body: esMovie,
    });

    return res.status(201).json({
      message: "Movie created successfully",
      movie: esMovie,
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const errors = formatError(error);
      return res.status(422).json({ message: "Invalid data", errors });
    } else {
      console.error("Error in createMovie:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const getAllMovies = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { page = "1", limit = "18", genre, user, query } = req.query;

  const pageNumber: number = parseInt(page as string);
  const limitNumber: number = parseInt(limit as string);
  const from: number = (pageNumber - 1) * limitNumber;

  try {
    // Building the search query for ElasticSearch
    const searchQuery: any = {
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
        term: { createdBy: parseInt(user as string) },
      });
    }

    // Search by query in title or description
    if (query) {
      searchQuery.bool.must.push({
        multi_match: {
          query: query as string,
          fields: ["title", "description"],
          fuzziness: "AUTO",
        },
      });
    }

    // Execute the search query
    const result = await esClient.search({
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

    const movieIds = hits.map((hit) => parseInt(hit._id ?? ""));

    const averageRatings = await prisma.rate.groupBy({
      by: ["movieId"],
      where: { movieId: { in: movieIds } },
      _avg: {
        score: true,
      },
    });

    const ratingMap = new Map(
      averageRatings.map((rating) => [rating.movieId, rating._avg.score])
    );

    // Format the movies to return
    const movies: FormattedMovie[] = result.hits.hits.map(
      (hit): FormattedMovie => {
        const source = hit._source as ElasticsearchMovie;
        return {
          id: hit._id ?? "",
          title: source.title,
          image:
            source.image && source.image.startsWith("http")
              ? source.image
              : source.image
              ? `${process.env.APP_URL}/images/${source.image}`
              : "default-image-url.jpg",
          releaseDate: source.releaseDate,
          description: source.description,
          createdBy: source.createdBy,
          genres: source.genres,
          averageRating: ratingMap.get(parseInt(hit._id ?? "")) ?? null,
          duration: source.duration,
        };
      }
    );

    // Check totalMovies (Elasticsearch might return it as an object)
    const totalMovies =
      typeof result.hits.total === "number"
        ? result.hits.total
        : result.hits.total?.value || 0;

    return res.json({
      message: "Movies fetched successfully",
      movies,
      totalMovies,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return res
      .status(500)
      .json({ message: "Error fetching movies", error: errorMessage });
  }
};

export const getMovieById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  try {
    if (id) {
      const result = await esClient.get({
        index: "movies",
        id: id as string,
      });

      if (!result.found) {
        return res.status(404).json({ message: "Movie not found" });
      }

      const averageRating = await prisma.rate.aggregate({
        where: { movieId: parseInt(id as string) },
        _avg: { score: true },
      });

      const userID: number | undefined = req.user?.id;
      const userRating = await prisma.rate.findFirst({
        where: { movieId: parseInt(id as string), userId: userID },
      });

      const movie = result._source as ElasticsearchMovie;
      // console.log("movie genres", movie.genres);

      const genreIdArray = await prisma.genre
        .findMany({
          where: { name: { in: movie.genres } },
          select: { id: true },
        })
        .then((genres) => genres.map((genre) => genre.id.toString())); // Convert to string

      const formattedMovie: FormattedMovie = {
        id: result._id,
        title: movie.title,
        image: movie.image
          ? movie.image.startsWith("http")
            ? movie.image
            : `${process.env.APP_URL}/images/${movie.image}`
          : "default-image-url.jpg",
        releaseDate: movie.releaseDate,
        description: movie.description,
        createdBy: movie.createdBy,
        genres: movie.genres,
        genreIds: genreIdArray,
        averageRating: averageRating._avg.score ?? null,
        userRating: userRating?.score ?? 0,
        duration: movie.duration ?? null,
      };

      return res.json({
        message: "Movie",
        movie: formattedMovie,
      });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return res
      .status(500)
      .json({ message: "Error fetching movies", error: errorMessage });
  }
};

// Update Movie Controller
export const updateMovie = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  try {
    const movieData: Partial<MovieData> = updateMovieSchema.parse(req.body);

    // Check if the movie exists in the database
    const existingMovie = await prisma.movie.findUnique({
      where: { id: parseInt(id) },
      include: { genres: { include: { genre: true } } },
    });

    if (!existingMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    let imageName: string = existingMovie.image || "default-image.jpg";

    // Handle image upload
    if (req.files && "image" in req.files) {
      const movieImage = req.files.image as UploadedFile;

      const validationMessages: string | null = imageValidator(
        movieImage.size,
        movieImage.mimetype
      );
      if (validationMessages !== null) {
        return res.status(400).json({ message: validationMessages });
      }

      const imgExt: string | undefined = movieImage.name.split(".").pop();
      imageName = `${generateRandom()}.${imgExt}`;
      const uploadPath: string = path.join(
        process.cwd(),
        "public",
        "images",
        imageName
      );

      ensureDirectoryExistence(uploadPath);
      await new Promise<void>((resolve, reject) => {
        movieImage.mv(uploadPath, (err: Error | null) => {
          if (err) {
            console.error("Error during file upload:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      if (existingMovie.image && existingMovie.image !== "default-image.jpg") {
        removeImage(existingMovie.image);
      }
    }

    const updatedMovie = await prisma.movie.update({
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
          create: movieData.genres.map((genreId: number) => ({
            genre: { connect: { id: genreId } },
          })),
        },
      },
      include: { genres: { include: { genre: true } } },
    });

    // Fetch the updated movie with genres
    const movieWithGenres = await prisma.movie.findUnique({
      where: { id: parseInt(id) },
      include: { genres: { include: { genre: true } } },
    });

    if (!movieWithGenres) {
      return res.status(404).json({ message: "Updated movie not found" });
    }

    // Prepare data for Elasticsearch
    const elasticsearchMovie: ElasticsearchMovie = {
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
    await esClient.update({
      index: "movies",
      id: id,
      body: {
        doc: elasticsearchMovie,
      },
    });

    // Prepare the response with genres
    const responseMovie = {
      ...movieWithGenres,
      genres: movieWithGenres.genres.map((g) => g.genre),
    };

    return res.json({
      message: "Movie updated successfully in database and Elasticsearch",
      movie: updatedMovie,
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const errors = formatError(error);
      return res.status(422).json({ message: "Invalid data", errors });
    } else {
      console.error("Error updating movie:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
};
export const deleteMovie = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    const existingMovie = await esClient.get({
      index: "movies",
      id: id,
    });

    if (!existingMovie.found) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const existingMovieSource = existingMovie._source as ElasticsearchMovie;
    if (
      existingMovieSource.image &&
      existingMovieSource.image !== "default-image.jpg"
    ) {
      removeImage(existingMovieSource.image);
    }

    await esClient.delete({
      index: "movies",
      id: id,
    });

    return res.json({ message: "Movie deleted successfully" });
  } catch (err: unknown) {
    console.error("Error deleting movie:", err);
    return res
      .status(500)
      .json({ message: "Error deleting movie", error: (err as Error).message });
  }
};

// Rating movie
export const addRating = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { movieId, score } = req.body;
    const userId = req.user?.id;

    if (score < 0 || score > 5) {
      return res.status(400).json({ error: "Score must be between 0 and 5." });
    }

    if (!userId) {
      return res.status(401).json({ error: "Login required for rating." });
    }

    const existingRating = await prisma.rate.findFirst({
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

    await prisma.rate.create({
      data: {
        score,
        movieId: parseInt(movieId),
        userId,
      },
    });

    return res.status(201).json({ message: "Rated successfully" });
  } catch (error) {
    console.error("Error adding rating:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while adding the rating." });
  }
};

export const getRelatedMovies = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(id) },
      include: {
        genres: {
          select: {
            genreId: true,
          },
        },
      },
    });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const genreIds = movie.genres.map((g) => g.genreId);

    const relatedMovies = await prisma.movie.findMany({
      where: {
        id: {
          not: movie.id,
        },
        genres: {
          some: {
            genreId: {
              in: genreIds,
            },
          },
        },
      },
      include: {
        genres: {
          select: {
            genre: true,
          },
        },
      },
      take: 5,
    });

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
  } catch (error) {
    console.error("Error fetching related movies:", error);
    return res.status(500).json({ message: "Error fetching related movies" });
  }
};

export const getAllGenres = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const genres = await prisma.genre.findMany();
    return res.status(200).json(genres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    return res.status(500).json({ message: "Error fetching genres" });
  }
};
