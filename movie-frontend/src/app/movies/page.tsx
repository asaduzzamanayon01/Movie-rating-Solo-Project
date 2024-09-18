/* eslint-disable @next/next/no-img-element */
"use client";
import Categories from "@/components/base/Categories";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Movie {
  id: number;
  title: string;
  image: string;
  releaseDate: number;
  //   type: string;
  //   certificate: string | null;
  //   createdBy: string;
  //   genres: string[];
  averageRating: number | null;
}

const MoviesPage = () => {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/all-movies");
        const data = await response.json();
        if (response.ok) {
          setMovies(data.movies);
        } else {
          console.error("Failed to fetch movies");
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div>
      <Categories />
      <main className="container mx-auto bg-black p-5">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">
          Best Movies in Theaters (2024)
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <div
              onClick={() => router.push(`/movie-detail/${movie.id}`)}
              key={movie.id}
              className="bg-slate-800 rounded shadow overflow-hidden transform transition duration-300 hover:scale-105"
            >
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-500 font-bold">
                    {movie.averageRating ?? "N/A"}
                  </span>
                  {/* <span className="font-bold">Categories: </span>
                  <span>{movie.genres.join(", ")}</span> */}
                </div>
                <h2 className="font-bold text-lg text-white">{movie.title}</h2>
                <p className="text-sm text-white">Opened {movie.releaseDate}</p>
                <button className="mt-2 w-full bg-yellow-600 text-white py-2 rounded hover:bg-blue-700">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Load More Button */}
      <div className="container mx-auto text-center py-8 bg-black">
        <button className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Load More
        </button>
      </div>
    </div>
  );
};

export default MoviesPage;
