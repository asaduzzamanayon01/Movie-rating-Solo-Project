import React, { useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";
import Cookies from "js-cookie";

function HamburgurMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const userName = Cookies.get("firstName");
  const { handleLogout } = useContext(AuthContext)!;
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  return (
    <div>
      {" "}
      <div className="relative">
        <button
          onClick={toggleMenu}
          className={`text-white focus:outline-none transform transition-transform ${
            menuOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
        {/* Hamburger Menu */}
        {menuOpen && (
          <div className="absolute top-full right-0 w-48 bg-white shadow-lg z-10 rounded-lg mt-2">
            <div className="p-4 border-b">
              <span className="text-black">Hello, {userName}</span>
            </div>
            <div
              className="p-4 bg-yellow-500 text-black hover:bg-yellow-600 cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </div>
            <Link href="/create-movie">
              <div className="p-4 bg-yellow-500 text-black hover:bg-yellow-600 cursor-pointer">
                Create Movie
              </div>
            </Link>
            <div
              className="p-4 bg-yellow-500 text-black hover:bg-yellow-600 cursor-pointer"
              onClick={() => router.push(`?user=${Cookies.get("userId")}`)}
            >
              My Movies
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HamburgurMenu;
