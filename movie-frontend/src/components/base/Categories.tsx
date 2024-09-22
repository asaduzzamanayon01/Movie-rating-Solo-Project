/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
}

function Categories() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/all-genre");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: number | null) => {
    setActiveCategory(categoryId);
    if (categoryId) {
      router.push(`/movies?genre=${categoryId}`);
    } else {
      router.push("/movies");
    }
    setShowDropdown(false); // Close dropdown after selection
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div>
      <section className="bg-red-500 py-6">
        <div className="container mx-auto flex flex-wrap justify-center space-x-4">
          <button
            className={`px-5 py-2 rounded-full shadow-lg hover:bg-yellow-500 transition ${
              activeCategory === null
                ? "bg-yellow-500 text-white"
                : "bg-white text-black"
            }`}
            onClick={() => handleCategoryClick(null)}
          >
            All
          </button>
          {categories.slice(0, 6).map((category) => (
            <button
              key={category.id}
              className={`px-5 py-2 rounded-full shadow-lg hover:bg-yellow-500 transition ${
                activeCategory === category.id
                  ? "bg-yellow-500 text-white"
                  : "bg-white text-black"
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </button>
          ))}
          {categories.length > 6 && (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="px-5 py-2 rounded-full shadow-lg bg-white text-black hover:bg-yellow-500 transition flex items-center"
              >
                More Categories
                <span
                  className={`ml-2 transform transition-transform ${
                    showDropdown ? "rotate-180" : "rotate-0"
                  }`}
                >
                  &#x25BC; {/* Right arrow */}
                </span>
              </button>
              {showDropdown && (
                <div className="absolute z-10 bg-white shadow-lg rounded-md mt-2 w-48">
                  {categories.slice(6).map((category) => (
                    <div
                      key={category.id}
                      className={`flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-yellow-500 transition ${
                        activeCategory === category.id
                          ? "bg-yellow-500 text-white"
                          : "text-black"
                      }`}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <span>{category.name}</span>
                      <span className="text-gray-400">→</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Categories;
