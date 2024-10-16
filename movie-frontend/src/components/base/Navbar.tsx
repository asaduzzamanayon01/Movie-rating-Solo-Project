/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import { AuthContext } from "../../context/AuthContext";
import HamburgurMenu from "./HamburgurMenu";
import { usePathname } from "next/navigation";

export const Navbar = () => {
    const pathname = usePathname();
    const { isAuthenticated } = useContext(AuthContext)!;
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {}, [isAuthenticated]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setSearchResults([]); // Close dropdown if clicked outside
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = debounce(async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:8000/api/movies?query=${query}&limit=10` // Updated API endpoint
            );
            if (!res.ok) {
                throw new Error("Error searching movies");
            }
            const data = await res.json();
            setSearchResults(data.movies || []);
        } catch (error) {
            console.error("Error searching movies:", error);
        }
    }, 300);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        handleSearch(query);
        if (pathname === "/movies") {
            router.push(`?query=${query}`);
        }
    };

    const handleMovieClick = (id: string) => {
        setSearchResults([]); // Close the search dropdown
        router.push(`/movie/${id}`);
    };

    return (
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
                <div className="flex items-center space-x-4 w-full max-w-lg relative">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={handleInputChange}
                        className="px-4 py-2 bg-white text-black focus:outline-none w-full rounded-lg"
                    />
                    {searchResults.length > 0 && pathname != "/movies" && (
                        <div
                            ref={dropdownRef}
                            className="absolute top-full left-0 w-full bg-white text-black shadow-lg z-10 rounded-lg mt-1"
                        >
                            {searchResults.map((movie) => (
                                <div
                                    key={movie.id}
                                    className="flex items-center p-4 border-b border-gray-300 bg-slate-950 hover:bg-slate-800"
                                    onClick={() => handleMovieClick(movie.id)}
                                >
                                    <img
                                        src={movie.image}
                                        alt={movie.title}
                                        className="h-16 mr-4"
                                    />
                                    <div>
                                        <h3 className="font-bold hover:text-yellow-600 text-white">
                                            {movie.title}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Hamburger Button: Only visible for authenticated users */}
                {isAuthenticated && <HamburgurMenu />}

                {/* Login Button: Only visible for unauthorized users */}
                {!isAuthenticated && (
                    <Link href="/login">
                        <button className="login-btn bg-yellow-500 px-4 py-2 rounded text-black hover:bg-yellow-600">
                            Login
                        </button>
                    </Link>
                )}
            </div>
        </header>
    );
};
