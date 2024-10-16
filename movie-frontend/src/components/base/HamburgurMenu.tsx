import React, { useState, useContext, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";
import Cookies from "js-cookie";

function HamburgurMenu() {
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();
    const userName = Cookies.get("firstName");
    const { handleLogout } = useContext(AuthContext)!;
    const menuRef = useRef(null);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };
    const handleClickCreate = () => {
        router.replace(`/create-movie`);
    };
    const handleClickUpdate = () => {
        router.replace(`/movies?user=${Cookies.get("userId")}`);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={toggleMenu}
                className="ham-menu text-white focus:outline-none"
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
            {menuOpen && (
                <div className="absolute top-full right-0 w-48 bg-white shadow-lg z-50 rounded-lg mt-2">
                    <div className="p-4 border-b">
                        <span className="text-black">Hello, {userName}</span>
                    </div>
                    <div
                        className="p-4 bg-yellow-500 text-black hover:bg-yellow-600 cursor-pointer"
                        onClick={handleLogout}
                    >
                        Logout
                    </div>
                    {/* <Link href="/create-movie"> */}
                    <div
                        className="create-movie p-4 bg-yellow-500 text-black hover:bg-yellow-600 cursor-pointer"
                        onClick={handleClickCreate}
                    >
                        Create Movie
                    </div>
                    {/* </Link> */}
                    {/* <Link href={`movies?user=${Cookies.get("userId")}`}> */}
                    <div
                        className="p-4 bg-yellow-500 text-black hover:bg-yellow-600 cursor-pointer"
                        onClick={handleClickUpdate}
                    >
                        My Movies
                    </div>
                    {/* </Link> */}
                </div>
            )}
        </div>
    );
}

export default HamburgurMenu;
