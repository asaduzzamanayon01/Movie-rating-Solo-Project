/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import RelatedMovies from "../../../components/RelatedMovies";
import { Rating } from "@/components/Rating";
import { ToastContainer, toast } from "react-toastify";

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
  userRating: number | 0;
  description: string | null;
}

const MovieDetailPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setRating] = useState<number>(0); // State to store the selected rating

  const fetchMovie = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/movie/${id}`);
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
      toast.warning("User is not authenticated");
      router.push("/login");
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
      <ToastContainer position="top-right" />
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
        <div className="w-full md:w-1/3 h-[600px] bg-gray-900 text-white p-5 overflow-y-auto space-y-4 no-scrollbar">
          <RelatedMovies movieId={movie.id} />
        </div>
      </div>
      <div className="w-full bg-black py-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Movie Information */}
            <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-4xl font-extrabold mb-6 text-white border-b-2 border-gray-600 pb-2">
                {movie.title}{" "}
                <Rating width={100} value={movie.averageRating ?? 0} readOnly />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* First Row: 2 items */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300">
                  <p className="text-lg text-white">
                    <span className="font-semibold">Released:</span>{" "}
                    {movie.releaseDate}
                  </p>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300">
                  <p className="text-lg text-white">
                    <span className="font-semibold">Genre:</span>{" "}
                    {movie.genres.map((genre) => genre).join(", ")}
                  </p>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300">
                  <p className="text-lg text-white">
                    <span className="font-semibold">Created By:</span>{" "}
                    {movie.createdBy}
                  </p>
                </div>
                {/* Full Row: Description */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300">
                  <p className="text-lg text-white">
                    <span className="font-semibold">Description:</span>{" "}
                    {movie.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Movie Poster & Actions */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex-none w-full md:w-1/3 h-fit">
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-72 object-cover rounded-lg shadow-lg"
              />

              {/* Star Rating Component */}
              <div className="text-center mt-4">
                <Rating
                  value={movie.userRating}
                  onChange={handleRatingChange}
                  readOnly={false}
                  width={500}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
