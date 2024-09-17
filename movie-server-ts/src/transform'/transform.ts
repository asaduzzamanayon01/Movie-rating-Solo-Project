import { getImageUrl } from "../utils/helper";
import {
  Movie as PrismaMovie,
  User as PrismaUser,
  Genre as PrismaGenre,
} from "@prisma/client";

// Define the types for your Prisma models
interface User extends PrismaUser {
  // No additional fields needed since PrismaUser type covers all
}

interface Genre extends PrismaGenre {
  // No additional fields needed since PrismaGenre type covers all
}

interface Movie extends PrismaMovie {
  user?: User; // Optional user relation
  genres?: Genre[]; // Optional genres relation
}

// Define the return type for your transformation function
interface TransformedMovie {
  id: number;
  title: string;
  image: string;
  releaseDate: number;
  votes?: number; // Made optional to align with Movie's type
  duration?: number; // Made optional to align with Movie's type
  type: string;
  certificate?: string;
  episodes?: number;
  nudity?: string;
  violence?: string;
  profanity?: string;
  alcohol?: string;
  frightening?: string;
  genres: string[];
}

export const movieTransform = (movie: Movie): TransformedMovie => {
  return {
    id: movie.id,
    title: movie.title,
    image: getImageUrl(movie.image),
    releaseDate: movie.releaseDate,
    votes: movie.votes ?? undefined, // Convert null to undefined
    duration: movie.duration ?? undefined, // Convert null to undefined
    type: movie.type,
    certificate: movie.certificate ?? undefined,
    episodes: movie.episodes ?? undefined, // Convert null to undefined
    nudity: movie.nudity ?? undefined,
    violence: movie.violence ?? undefined,
    profanity: movie.profanity ?? undefined,
    alcohol: movie.alcohol ?? undefined,
    frightening: movie.frightening ?? undefined,
    genres: movie.genres?.map((genre) => genre.name) || [], // Map genre objects to their names
  };
};
