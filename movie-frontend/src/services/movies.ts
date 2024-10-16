// services/movies.ts
import { customFetcher } from "./customFetch";

interface Movie {
  id: number;
  title: string;
  image: string;
  releaseDate: number;
  averageRating: number | null;
}

export const fetchMovies = async (pageNum: number, genre?: string, user?: number, query?: string): Promise<Movie[]> => {
  let url = `http://localhost:8000/api/movies?page=${pageNum}&limit=18`;
  if (genre) url += `&genre=${genre}`;
  if (user) url += `&user=${user}`;
  if (query) url += `&query=${query}`;

  try {
    const data = await customFetcher<{ movies: Movie[] }>(url, {}, 30000);
    return data.movies;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

  export const deleteMovie = async (movieId: number, token: string) => {
    try {
        const response = await customFetcher<{ movies: Movie[] }>(`http://localhost:8000/api/movie/${movieId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }, 30000);
    } catch (error) {
        console.error("Error fetching movies:", error);
        throw error;
    }
  };
