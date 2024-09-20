/* eslint-disable @next/next/no-img-element */
"use client";
// import Categories from "@/components/base/Categories";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Rating } from "@/components/Rating";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface Movie {
  id: number;
  title: string;
  image: string;
  releaseDate: number;
  averageRating: number | null;
}

const MoviesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook to get the query parameters
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalMovies, setTotalMovies] = useState<number>(0);
  const cookieUserId = Cookies.get("userId");
  const userIdFromUrl = searchParams.get("user");

  // Clear the movie list and reset the page when category changes
  const fetchMovies = async (page: number, genre?: number, user?: number) => {
    try {
      setLoading(true);
      // Build the API URL with optional genre filter
      let url = `http://localhost:8000/api/all-movies?page=${page}&limit=18 `;
      if (genre) {
        url += `&genre=${genre}`;
      }
      if (user) {
        url += `&user=${user}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        if (page === 1) {
          setMovies(data.movies); // Replace movies on the first page
        } else {
          setMovies((prevMovies) => [
            ...prevMovies,
            ...data.movies.filter(
              (newMovie: Movie) => !prevMovies.some((m) => m.id === newMovie.id)
            ),
          ]); // Append new movies for additional pages
        }
        setTotalMovies(data.totalMovies); // Total number of movies available
      } else {
        console.error("Failed to fetch movies");
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch movies on initial load and whenever the URL query parameter changes
  useEffect(() => {
    const genre = searchParams.get("genre"); // Get genre from URL query parameter
    const genreId = genre ? parseInt(genre, 10) : undefined; // Parse genre ID to number
    const user = searchParams.get("user"); // Get genre from URL query parameter
    const userId = user ? parseInt(user, 10) : undefined; // Parse genre ID to number
    setMovies([]); // Clear movie list when category changes
    setPage(1); // Reset to page 1 when category changes
    fetchMovies(1, genreId, userId); // Fetch movies based on the current page and genre
  }, [searchParams]); // Re-run effect when query parameters change

  const handleLoadMore = () => {
    if (movies.length < totalMovies) {
      setPage((prevPage) => prevPage + 1); // Increment page number to fetch the next set
      const genre = searchParams.get("genre"); // Get the genre from query params
      const genreId = genre ? parseInt(genre, 10) : undefined;
      const user = searchParams.get("user"); // Get the genre from query params
      const userId = user ? parseInt(user, 10) : undefined;
      fetchMovies(page + 1, genreId, userId); // Fetch movies for the next page
    }
  };
  const handleUpdate = (movieId: number) => {
    router.push(`update-movie/${movieId}`);
  };

  const handleDeleteMovie = async (movieId: number) => {
    const token = Cookies.get("token"); // Get the token from cookies

    try {
      const response = await fetch(
        `http://localhost:8000/api/delete-movie/${movieId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the headers
          },
        }
      );

      if (response.ok) {
        // Remove the deleted movie from the list
        setMovies((prevMovies) =>
          prevMovies.filter((movie) => movie.id !== movieId)
        );
        toast.success("Movie deleted successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to delete movie."); // Show error message
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast.error("An unexpected error occurred. Please try again."); // Show generic error message
    }
  };

  if (loading && page === 1) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div>
      <main className="container mx-auto bg-black p-5">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">
          Best Movies in Theaters (2024)
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="bg-slate-800 rounded shadow overflow-hidden transform transition duration-300 hover:scale-105"
            >
              <img
                onClick={() => router.push(`/movie-detail/${movie.id}`)}
                src={movie.image}
                alt={movie.title}
                className="w-full h-48 object-cover hover:cursor-pointer"
              />
              <div className="p-4 bg-gray-800 rounded-lg shadow-md">
                {/* Movie Title */}
                <h2
                  className="font-bold text-lg text-white mb-2"
                  onClick={() => router.push(`/movie-detail/${movie.id}`)}
                >
                  {movie.title}
                </h2>

                {/* Rating and Release Date */}
                <div className="flex justify-between items-center mb-2">
                  {/* Rating on the left */}
                  <span className="text-yellow-500 font-bold">
                    <Rating
                      width={100}
                      value={movie.averageRating ?? 0}
                      readOnly={true}
                    />
                  </span>

                  {/* Release Date on the right */}
                  <p className="text-sm text-gray-400">
                    Opened {movie.releaseDate}
                  </p>
                </div>

                {/* Update/Delete Buttons (only visible if the condition is met) */}
                {cookieUserId && cookieUserId === userIdFromUrl && (
                  <div className="flex justify-between mt-2">
                    <button
                      className="text-white bg-yellow-500 px-4 py-1 rounded hover:bg-yellow-600"
                      onClick={() => handleUpdate(movie.id)}
                    >
                      Update
                    </button>
                    <button
                      className="text-white bg-red-500 px-4 py-1 rounded hover:bg-red-600"
                      onClick={() => handleDeleteMovie(movie.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Load More Button */}
      <div className="container mx-auto text-center py-8 bg-black">
        {movies.length < totalMovies && ( // Show button only if more movies are available
          <button
            className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            onClick={handleLoadMore}
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
