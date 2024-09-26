/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import "daisyui";
import AlphabeticalSelect from "@/components/ui/alphabetical-select-component";
import FileUploadComponent from "../../../components/ui/file-upload-component";

interface Genre {
  id: string;
  name: string;
}

interface FormData {
  title: string;
  image: File | null;
  releaseDate: string;
  genreIds: string[];
  description: string;
}

interface Errors {
  title?: string;
  image?: string;
  releaseDate?: string;
  genreIds?: string;
  description?: string;
}

const UpdateMovieForm = () => {
  const { loading, setLoading } = useContext(AuthContext)!;
  const router = useRouter();
  const { id } = useParams();
  const userId = Cookies.get("userId");
  const [formData, setFormData] = useState<FormData>({
    title: "",
    image: null,
    releaseDate: "",
    genreIds: [],
    description: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/genres");
        const data = await response.json();
        setGenres(data);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/movie/${id}`);
        const data = await response.json();
        if (response.ok) {
          const movie = data.movie;

          const releaseDate = movie.releaseDate
            ? new Date(movie.releaseDate, 0, 1).toISOString().split("T")[0]
            : "";

          const movieGenres = movie.genreIds.map(
            (id: string, index: number) => ({
              value: id,
              label: movie.genres[index],
            })
          );

          setFormData({
            title: movie.title || "",
            image: null,
            releaseDate: releaseDate,
            genreIds: movie.genreIds.map((id) => Number(id)),
            description: movie.description || "",
          });
          setSelectedGenres(movieGenres);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { files: File[]; name: string } }
  ) => {
    const file =
      "files" in e.target
        ? e.target.files[0]
        : e.target.files
        ? e.target.files[0]
        : null;
    setFormData({
      ...formData,
      [e.target.name]: file,
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

  const handleGenreChange = (selectedIds: string[]) => {
    setFormData({
      ...formData,
      genreIds: selectedIds.map((id) => Number(id)),
    });
  };

  const token = Cookies.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    if (formData.image) formDataToSend.append("image", formData.image);
    formDataToSend.append("releaseDate", formData.releaseDate.split("-")[0]);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("genres", JSON.stringify(formData.genreIds));

    try {
      const response = await fetch(
        `http://localhost:8000/api/movie/update/${id}`,
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
        setTimeout(() => {
          router.replace(`/movies?user=${userId}`);
        }, 1500);
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
    value: Number(genre.id),
    label: genre.name,
  }));

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer autoClose={1000} position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full space-y-8 bg-yellow-600 p-10 rounded-xl shadow-2xl"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-extrabold text-center text-gold-500"
        >
          Update Movie
        </motion.h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <input
                type="text"
                name="title"
                placeholder="Movie Title"
                value={formData.title}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gold-500 focus:border-gold-500 focus:z-10 sm:text-sm`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </motion.div>
            <FileUploadComponent
              handleFileChange={handleFileChange}
              imagePreview={imagePreview}
              errors={errors}
            />

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <input
                type="date"
                name="releaseDate"
                placeholder="Release Date"
                value={formData.releaseDate}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.releaseDate ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-gold-500 focus:border-gold-500 focus:z-10 sm:text-sm my-2`}
              />
              {errors.releaseDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.releaseDate}
                </p>
              )}
            </motion.div>
            <div>
              <AlphabeticalSelect
                options={genreOptions}
                value={formData.genreIds}
                onChange={handleGenreChange}
                placeholder="Select Genre"
                className="rounded-none"
              />
              {errors.genreIds && (
                <p className="text-red-500 text-xs mt-1">{errors.genreIds}</p>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <textarea
                name="description"
                placeholder="Movie Description"
                value={formData.description}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gold-500 focus:border-gold-500 focus:z-10 sm:text-sm mt-2`}
                rows={4}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </motion.div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.8 }}
            className="text-center"
          >
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-800 hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {loading ? "Updating..." : "Update Movie"}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdateMovieForm;
