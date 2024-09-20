/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import Cookies from "js-cookie";
import Select from "react-tailwindcss-select";
import "daisyui";

interface Genre {
  id: number;
  name: string;
}

interface FormData {
  title: string;
  image: File | null;
  releaseDate: string;
  genres: string[]; // This will be genre IDs
  description: string;
}

interface Errors {
  title?: string;
  image?: string;
  releaseDate?: string;
  genres?: string;
  description?: string;
}

const UpdateMovieForm = () => {
  const { loading, setLoading } = useContext(AuthContext)!;
  const router = useRouter();
  const { id } = useParams(); // Get the movie ID from URL params

  const [formData, setFormData] = useState<FormData>({
    title: "",
    image: null,
    releaseDate: "",
    genres: [], // Array of genre IDs
    description: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [genres, setGenres] = useState<Genre[]>([]); // All available genres
  const [selectedGenres, setSelectedGenres] = useState<any[]>([]); // Selected genre objects
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [genreIds, setGenreIds] = useState<number[]>([]); // Only genre IDs

  // Fetch all genres from backend
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/all-genre");
        const data = await response.json();
        setGenres(data); // Set the available genres
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/movie-detail/${id}`
        );
        const data = await response.json();

        if (response.ok) {
          const movie = data.movie;

          const releaseDate = movie.releaseDate
            ? new Date(movie.releaseDate).toISOString().split("T")[0]
            : "";

          const movieGenres = movie.genres.map(
            (genre: { id: number; name: string }) => ({
              value: genre.id.toString(), // Use genre.id as the value (stringified)
              label: genre.name, // Use genre.name as the label
            })
          );

          const genreIdsArray = movie.genres.map(
            (genre: { id: number }) => genre.id // Extract the IDs
          );

          setFormData({
            title: movie.title || "",
            image: null,
            releaseDate: releaseDate,
            genres: genreIdsArray, // Set genre IDs here
            description: movie.description || "",
          });
          setSelectedGenres(movieGenres); // Set preselected genres
          setGenreIds(genreIdsArray); // Store genre IDs in state
          setImagePreview(movie.image);
        } else {
          toast.error("Error fetching movie details");
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
        toast.error("Failed to fetch movie details.");
      }
    };

    fetchMovie();
  }, [id]);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData({
      ...formData,
      image: file,
    });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Handle genre selection change
  const handleGenreChange = (value: any) => {
    const selectedIds = value
      ? value.map((item: any) => Number(item.value)) // Extract the genre IDs
      : [];
    setSelectedGenres(value); // Update selected genres
    setGenreIds(selectedIds); // Update genre IDs array
  };

  const token = Cookies.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    if (formData.image) formDataToSend.append("image", formData.image);
    formDataToSend.append("releaseDate", formData.releaseDate);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("genres", JSON.stringify(genreIds)); // Pass the genre IDs array

    try {
      const response = await fetch(
        `http://localhost:8000/api/update-movie/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (response.ok) {
        toast.success("Movie updated successfully!");
        router.push("/movies");
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
        } else if (errorData.message) {
          toast.error(errorData.message);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const genreOptions = genres.map((genre) => ({
    value: genre.id.toString(),
    label: genre.name,
  }));

  return (
    <div className="bg-white p-8 shadow-md rounded-lg max-w-3xl mx-auto my-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <h1 className="text-4xl font-bold text-center mb-8">Update Movie</h1>

        {/* Title */}
        <div>
          <input
            type="text"
            name="title"
            placeholder="Movie Title"
            value={formData.title}
            onChange={handleChange}
            className={`input input-bordered w-full ${
              errors.title ? "input-error" : ""
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Image */}
        <div>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className={`file-input file-input-bordered w-full ${
              errors.image ? "input-error" : ""
            }`}
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image}</p>
          )}
        </div>
        {imagePreview && (
          <div className="mt-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-1/2 h-1/2 rounded-lg"
            />
          </div>
        )}

        {/* Release Date */}
        <div>
          <input
            type="date"
            name="releaseDate"
            placeholder="Release Date"
            value={formData.releaseDate}
            onChange={handleChange}
            className={`input input-bordered w-full ${
              errors.releaseDate ? "input-error" : ""
            }`}
          />
          {errors.releaseDate && (
            <p className="text-red-500 text-sm mt-1">{errors.releaseDate}</p>
          )}
        </div>

        {/* Genres */}
        <div>
          <Select
            primaryColor="indigo"
            value={selectedGenres}
            onChange={handleGenreChange}
            options={genreOptions}
            isMultiple={true}
            isClearable={true}
            placeholder="Select Genre"
            classNames={{
              tagItem: ({ item }) =>
                `inline-flex items-center bg-indigo-100 text-indigo-700 rounded px-2 py-1 mr-2 mt-1`,
              tagItemIcon: `w-4 h-4 ml-2 text-gray-400 hover:text-red-400 cursor-pointer`,
              menuButton: ({ isDisabled }) =>
                `text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition-all duration-300 focus:outline-none ${
                  isDisabled
                    ? "bg-gray-200"
                    : "bg-white hover:border-gray-400 focus:border-indigo-500"
                }`,
            }}
          />
          {errors.genres && (
            <p className="text-red-500 text-sm mt-1">{errors.genres}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <textarea
            name="description"
            placeholder="Movie Description"
            value={formData.description}
            onChange={handleChange}
            className={`textarea textarea-bordered w-full ${
              errors.description ? "textarea-error" : ""
            }`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
          >
            {loading ? "Updating..." : "Update Movie"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateMovieForm;
