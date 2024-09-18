/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import RelatedMovies from "../../../components/RelatedMovies"; // Adjust the import path as needed
import { Rating } from "@/components/Rating";
import { toast } from "sonner";

interface Movie {
  id: number;
  title: string;
  image: string;
  releaseDate: number;
  type: string;
  certificate: string | null;
  createdBy: string;
  genres: string[];
  averageRating: number | null;
}

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rating, setRating] = useState<number>(0); // State to store the selected rating

  const fetchMovie = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/movie-detail/${id}`
      );
      const data = await response.json();
      if (response.ok) {
        setMovie(data.movie);
      } else {
        toast.error("Failed to fetch movie details");
      }
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMovie();
  }, [id]);

  const handleRatingChange = async (newRating: number) => {
    setRating(newRating);

    const token = Cookies.get("token");

    if (!token) {
      toast.error("User is not authenticated");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/movie-rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Attach token from cookies
        },
        body: JSON.stringify({
          movieId: movie?.id,
          score: newRating,
        }),
      });

      if (response.ok) {
        fetchMovie();
        toast.success("Rated successfully");
      } else {
        const data = await response.json();
        console.error(data.error);
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error submitting rating");
    }
  };

  if (loading) {
    return <p className="text-center text-xl font-semibold">Loading...</p>;
  }

  if (!movie) {
    return <p className="text-center text-xl font-semibold">Movie not found</p>;
  }

  return (
    <div className="relative bg-gray-100 min-h-screen">
      {/* Background Image and Related Movies Section */}
      <div className="flex flex-col md:flex-row">
        {/* Background with Title */}
        <div className="relative w-full md:w-2/3 h-[600px]">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${movie.image})`,
              filter: "brightness(0.6)",
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-5xl md:text-7xl text-white font-bold tracking-wide drop-shadow-lg shadow-black text-center p-4">
              {movie.title}
            </h1>
          </div>
        </div>

        {/* Related Movies (scrollable) */}
        <div className="w-full md:w-1/3 h-[600px] bg-gray-900 text-white p-5 overflow-y-auto space-y-4">
          <RelatedMovies movieId={movie.id} />
        </div>
      </div>

      {/* Movie Details Section */}
      <div className="w-full bg-black py-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Movie Information */}
            <div className="col-span-2">
              <h2 className="text-4xl font-extrabold mb-6 text-white">
                {movie.title}
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-white">
                  <span className="font-semibold">Released:</span>{" "}
                  {movie.releaseDate}
                </p>
                <p className="text-lg text-white">
                  <span className="font-semibold">Genre:</span>{" "}
                  {movie.genres.join(", ")}
                </p>
                <p className="text-lg text-white">
                  <span className="font-semibold">Average Rating:</span>{" "}
                  {movie.averageRating ?? "N/A"}
                </p>
                <p className="text-lg text-white">
                  <span className="font-semibold">Created By:</span>{" "}
                  {movie.createdBy}
                </p>
                <p className="text-lg text-white">
                  <span className="font-semibold">Type:</span> {movie.type}
                </p>
              </div>
            </div>

            {/* Movie Poster & Actions */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg space-y-4">
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-72 object-cover rounded-lg shadow-lg"
              />

              {/* Star Rating Component */}
              <div className="text-center">
                <Rating value={rating} onChange={handleRatingChange} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
