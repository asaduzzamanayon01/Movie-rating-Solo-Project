import Link from "next/link";
import React from "react";

export const Navbar = () => {
  return (
    <div>
      <header className="bg-red-600 text-white py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/69/Rotten_Tomatoes_logo.svg"
              alt="Rotten Tomatoes"
              className="h-10"
            /> */}
          </div>
          <div className="flex items-center space-x-4 w-full max-w-lg">
            <input
              type="text"
              placeholder="Search"
              className="px-4 py-2 rounded bg-white text-black focus:outline-none w-full"
            />
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <button className="bg-yellow-500 px-4 py-2 rounded text-black hover:bg-yellow-600">
                Login
              </button>
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
};
