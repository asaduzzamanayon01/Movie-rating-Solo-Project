import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

function Categories() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [moreButtonLabel, setMoreButtonLabel] = useState("More");
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/genres");
        setCategories(
          response.data.sort((a: Category, b: Category) =>
            a.name.localeCompare(b.name)
          )
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleKeyScroll = (e: KeyboardEvent) => {
      if (showDropdown && dropdownRef.current) {
        const letter = e.key.toLowerCase();
        const index = categories
          .slice(5)
          .findIndex((category) =>
            category.name.toLowerCase().startsWith(letter)
          );
        if (index !== -1 && dropdownRef.current) {
          dropdownRef.current.scrollTo({
            top: index * 40,
            behavior: "smooth",
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyScroll);
    return () => {
      window.removeEventListener("keydown", handleKeyScroll);
    };
  }, [showDropdown, categories]);

  const handleCategoryClick = (categoryName: string | null) => {
    setActiveCategory(categoryName);
    if (categoryName) {
      if (
        categories.slice(5).find((category) => category.name === categoryName)
      ) {
        setMoreButtonLabel(categoryName);
      }
      router.push(`/movies?genre=${categoryName}`);
    } else {
      setMoreButtonLabel("More");
      router.push("/movies");
    }
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="bg-red-500 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-4">
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
          {categories.slice(0, 5).map((category) => (
            <button
              key={category.id}
              className={`px-5 py-2 rounded-full shadow-lg hover:bg-yellow-500 transition ${
                activeCategory === category.name
                  ? "bg-yellow-500 text-white"
                  : "bg-white text-black"
              }`}
              onClick={() => handleCategoryClick(category.name)}
            >
              {category.name}
            </button>
          ))}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="px-5 py-2 rounded-full shadow-lg bg-white text-black hover:bg-yellow-500 transition flex items-center"
            >
              <span>{moreButtonLabel}</span>
              <ChevronDown
                className={`ml-2 transition-transform ${
                  showDropdown ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute z-10 bg-white shadow-lg rounded-md mt-2 w-48 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400"
              >
                {categories.slice(5).map((category) => (
                  <div
                    key={category.id}
                    className={`p-3 border-b last:border-b-0 hover:bg-yellow-500 transition cursor-pointer ${
                      activeCategory === category.name
                        ? "bg-yellow-500 text-white"
                        : "text-black"
                    }`}
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <span className="text-left text-lg">{category.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categories;
