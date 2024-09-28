/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
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
  const [hasMore, setHasMore] = useState<boolean>(true);
  const cookieUserId = Cookies.get("userId");
  const userIdFromUrl = searchParams.get("user");
  const pathname = usePathname();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastMovieElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchMovies = useCallback(
    async (
      pageNum: number,
      genre?: string,
      user?: number,
      query?: string,
      reset: boolean = false
    ) => {
      try {
        setLoading(true);
        let url = `http://localhost:8000/api/movies?page=${pageNum}&limit=18`;
        if (genre) url += `&genre=${genre}`;
        if (user) url += `&user=${user}`;
        if (query) url += `&query=${query}`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
          setMovies((prevMovies) => {
            if (reset) {
              return data.movies;
            }
            const newMovies = data.movies.filter(
              (newMovie: Movie) => !prevMovies.some((m) => m.id === newMovie.id)
            );
            return [...prevMovies, ...newMovies];
          });
          setTotalMovies(data.totalMovies);
          setHasMore(data.movies.length === 18); // Assuming 18 is the page limit
        } else {
          console.error("Failed to fetch movies");
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const genre = searchParams.get("genre");
    const query = searchParams.get("query");
    const user = searchParams.get("user");
    const userId = user ? parseInt(user, 10) : undefined;
    setPage(1);
    fetchMovies(1, genre ?? undefined, userId, query ?? undefined, true);
  }, [searchParams, pathname, fetchMovies]);

  useEffect(() => {
    if (page > 1) {
      const genre = searchParams.get("genre");
      const query = searchParams.get("query");
      const user = searchParams.get("user");
      const userId = user ? parseInt(user, 10) : undefined;
      fetchMovies(page, genre ?? undefined, userId, query ?? undefined);
    }
  }, [page, searchParams, fetchMovies]);

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
        `http://localhost:8000/api/movie/${movieToDelete}`,
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
      <ToastContainer position="top-right" />
      <main className="container mx-auto p-5">
        <h1 className="text-4xl font-bold mb-8 text-left text-white">
          Movies List
        </h1>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className="bg-slate-800 rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 flex flex-col h-full"
              ref={index === movies.length - 1 ? lastMovieElementRef : null}
            >
              <div className="relative h-85">
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-full h-[400px] object-cover hover:cursor-pointer transition duration-300 hover:opacity-75"
                  onClick={() => router.push(`/movie/${movie.id}`)}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"
                  onClick={() => router.push(`/movie/${movie.id}`)}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 p-4 text-white"
                  onClick={() => router.push(`/movie/${movie.id}`)}
                >
                  <span
                    className="text-yellow-500 font-bold"
                    onClick={() => router.push(`/movie/${movie.id}`)}
                  >
                    <Rating
                      width={130}
                      value={movie.averageRating ?? 0}
                      readOnly={true}
                    />
                  </span>
                  <h2
                    className="font-bold text-lg mt-1 line-clamp-2 hover:text-yellow-500 transition duration-300 cursor-pointer"
                    onClick={() => router.push(`/movie/${movie.id}`)}
                  >
                    {movie.title}
                  </h2>
                  <p
                    className="text-sm text-gray-300"
                    onClick={() => router.push(`/movie/${movie.id}`)}
                  >
                    Opened {movie.releaseDate}
                  </p>
                </div>
              </div>

              {cookieUserId && cookieUserId === userIdFromUrl && (
                <div className="flex justify-between p-2 space-x-2 bg-gray-800">
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
          ))}
        </motion.div>
      </main>

      {loading && page > 1 && (
        <div className="flex justify-center items-center py-4">
          <RingLoader color="#FF0000" loading={loading} size={50} />
        </div>
      )}

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
