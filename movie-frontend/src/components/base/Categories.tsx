import React, { useState } from "react";

function Categories() {
  const [activeCategory, setActiveCategory] = useState(null);

  const categories = [
    "Most Popular",
    "Genre",
    "Rating",
    "Audience Score",
    "Tomatometer",
    "Certified Fresh",
  ];

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  return (
    <div>
      {/* Category and Sorting Filters */}
      <section className="bg-red-500 py-6">
        <div className="container mx-auto flex flex-wrap justify-center space-x-4">
          {categories.map((category) => (
            <button
              key={category}
              className={`${
                activeCategory === category
                  ? "bg-yellow-500 text-white"
                  : "bg-white text-black"
              } px-5 py-2 rounded-full shadow-lg hover:bg-yellow-500 transition`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Categories;
