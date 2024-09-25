/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { RingLoader } from "react-spinners";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Rating } from "@/components/Rating";

interface Movie {
  id: number;
  title: string;
  image: string;
  releaseDate: number;
  averageRating: number | null;
}

const MoviesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalMovies, setTotalMovies] = useState<number>(0);
  const cookieUserId = Cookies.get("userId");
  const userIdFromUrl = searchParams.get("user");
  const pathname = usePathname();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Clear the movie list and reset the page when category changes
  const fetchMovies = async (
    page: number,
    genre?: string,
    user?: number,
    query?: string
  ) => {
    try {
      setLoading(true);
      // Build the API URL with optional genre filter
      let url = `http://localhost:8000/api/movies?page=${page}&limit=18 `;
      if (genre) {
        url += `&genre=${genre}`;
      }
      if (user) {
        url += `&user=${user}`;
      }
      if (query) {
        url += `&query=${query}`;
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
    const genre = searchParams.get("genre");
    const genreName = genre ?? undefined;
    const query = searchParams.get("query");
    const queryName = query ?? undefined;
    const user = searchParams.get("user");
    const userId = user ? parseInt(user, 10) : undefined;
    setMovies([]); // Clear movie list when category changes
    setPage(1);
    fetchMovies(1, genreName, userId, queryName);
  }, [searchParams, pathname]);

  const handleLoadMore = () => {
    if (movies.length < totalMovies) {
      setPage((prevPage) => prevPage + 1);
      const genre = searchParams.get("genre");
      const genreName = genre ?? undefined;
      const query = searchParams.get("query");
      const queryName = query ?? undefined;
      const user = searchParams.get("user");
      const userId = user ? parseInt(user, 10) : undefined;
      fetchMovies(page + 1, genreName, userId, queryName); // Fetch movies for the next page
    }
  };

  const handleUpdate = (movieId: number) => {
    router.push(`update-movie/${movieId}`);
  };

  const handleDeleteMovie = async (movieId: number) => {
    setMovieToDelete(movieId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!movieToDelete) return;

    setIsDeleting(true);
    const token = Cookies.get("token");

    try {
      const response = await fetch(
        `http://localhost:8000/api/movie/delete/${movieToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setMovies((prevMovies) =>
          prevMovies.filter((movie) => movie.id !== movieToDelete)
        );
        toast.success("Movie deleted successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to delete movie.");
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setMovieToDelete(null);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center pt-20">
        <RingLoader color="#FF0000" loading={loading} size={180} />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen">
      <main className="container mx-auto p-5">
        <h1 className="text-4xl font-bold mb-8 text-left text-white">
          Movies List
        </h1>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 2 }}
          transition={{ duration: 0.5 }}
        >
          {movies.map((movie) => (
            <motion.div
              key={movie.id}
              className="bg-slate-800 rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 flex flex-col h-full"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
            >
              <img
                onClick={() => router.push(`/movie/${movie.id}`)}
                src={movie.image}
                alt={movie.title}
                className="w-full h-48 object-cover hover:cursor-pointer transition duration-300 hover:opacity-75"
              />
              <div className="p-4 bg-gray-800 rounded-b-lg shadow-md flex flex-col flex-grow">
                <span className="text-yellow-500 font-bold">
                  <Rating
                    width={130}
                    value={movie.averageRating ?? 0}
                    readOnly={true}
                  />
                </span>
                <h2
                  className="font-bold text-lg text-white mt-1 line-clamp-2 hover:text-yellow-500 transition duration-300"
                  onClick={() => router.push(`/movie/${movie.id}`)}
                >
                  {movie.title}
                </h2>

                <p className="text-sm text-gray-400">
                  Opened {movie.releaseDate}
                </p>

                <div className="flex-grow"></div>

                {cookieUserId && cookieUserId === userIdFromUrl && (
                  <div className="flex justify-between mt-2 space-x-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-yellow-500"
                      onClick={() => handleUpdate(movie.id)}
                    >
                      Update
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleDeleteMovie(movie.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <div className="container mx-auto text-center py-8">
        {movies.length < totalMovies && (
          <Button
            variant="secondary"
            size="lg"
            onClick={handleLoadMore}
            className="px-6 py-3 text-lg text-white bg-yellow-600"
          >
            Load More
          </Button>
        )}
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this movie?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              movie from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <RingLoader color="#ffffff" loading={true} size={24} />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MoviesPage;
