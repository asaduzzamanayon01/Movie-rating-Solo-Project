/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    const storedFirstName = Cookies.get("firstName");
    console.log(token);
    if (token && storedFirstName) {
      setLoggedIn(true);
      setFirstName(storedFirstName);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userId");
    Cookies.remove("firstName");
    setLoggedIn(false);
    setFirstName(null);
    router.push("/movies");
  };

  return (
    <div>
      <header className="bg-red-600 text-white p-5">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/movies">
              <img
                src="https://www.rottentomatoes.com/assets/pizza-pie/images/rtlogo.9b892cff3fd.png"
                alt="Rotten Tomatoes"
                className="h-10"
              />
            </Link>
          </div>
          <div className="flex items-center space-x-4 w-full max-w-lg">
            <input
              type="text"
              placeholder="Search"
              className="px-4 py-2 rounded bg-white text-black focus:outline-none w-full rounded-lg"
            />
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {loggedIn ? (
              <>
                <span className="text-white">Hello, {firstName}</span>
                <button
                  onClick={handleLogout}
                  className="bg-yellow-500 px-4 py-2 rounded text-black hover:bg-yellow-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login">
                <button className="bg-yellow-500 px-4 py-2 rounded text-black hover:bg-yellow-600">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};
