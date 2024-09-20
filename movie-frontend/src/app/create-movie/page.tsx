/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
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
  genres: string[];
  description: string;
}

interface Errors {
  title?: string;
  image?: string;
  releaseDate?: string;
  genres?: string;
  description?: string;
}

const CreateMovieForm = () => {
  const { loading, setLoading } = useContext(AuthContext)!;
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    image: null,
    releaseDate: "",
    genres: [],
    description: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/all-genre");
        const data = await response.json();
        setGenres(data);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

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
      ? value.map((item: any) => parseInt(item.value))
      : []; // Parse to numbers
    setSelectedGenres(value);
    setFormData((prev) => ({
      ...prev,
      genres: selectedIds,
    }));
  };

  const token = Cookies.get("token");

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    if (formData.image) formDataToSend.append("image", formData.image);
    formDataToSend.append("releaseDate", formData.releaseDate);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("genres", JSON.stringify(formData.genres));

    try {
      const response = await fetch("http://localhost:8000/api/create-movie", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success("Movie created successfully!");
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
        <h1 className="text-4xl font-bold text-center mb-8">Create Movie</h1>

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
            value={selectedGenres} // Use selectedGenres directly
            onChange={handleGenreChange}
            options={genreOptions}
            isMultiple={true}
            isClearable={true}
            placeholder="Select Genre" // Placeholder text
            classNames={{
              tagItem: ({ item }) =>
                `inline-flex items-center bg-indigo-100 text-indigo-700 rounded px-2 py-1 mr-2 mt-1`,
              tagItemIcon: `w-4 h-4 ml-2 text-gray-400 hover:text-red-400 cursor-pointer`,
              menuButton: ({ isDisabled }) =>
                `text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition-all duration-300 focus:outline-none ${
                  isDisabled
                    ? "bg-gray-200"
                    : "bg-white hover:border-gray-400 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20"
                }`,
              menu: "absolute z-10 w-full bg-white shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700",
              listItem: ({ isSelected }) =>
                `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded ${
                  isSelected
                    ? `text-white bg-indigo-500`
                    : `text-gray-500 hover:bg-indigo-100 hover:text-indigo-500`
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

        <button
          type="submit"
          className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Create Movie"}
        </button>
      </form>
    </div>
  );
};

export default CreateMovieForm;
