import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { motion } from "framer-motion";

const AlphabeticalSelect = ({ options, value = 0, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    // const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    const groupedOptions = options.reduce((acc, option) => {
        const firstLetter = option.label[0].toUpperCase();
        if (!acc[firstLetter]) {
            acc[firstLetter] = [];
        }
        acc[firstLetter].push(option);
        return acc;
    }, {});

    const filteredOptions = Object.entries(groupedOptions).reduce(
        (acc, [letter, options]) => {
            const filtered = options.filter((option) =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (filtered.length > 0) {
                acc[letter] = filtered;
            }
            return acc;
        },
        {}
    );

    // const scrollToLetter = (letter) => {
    //   const element = document.getElementById(`group-${letter}`);
    //   if (element) {
    //     element.scrollIntoView({ behavior: "smooth", block: "start" });
    //   }
    // };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleGenreToggle = (genreId) => {
        const newValue = value.includes(genreId)
            ? value.filter((id) => id !== genreId)
            : [...value, genreId];
        onChange(newValue);
    };

    return (
        <div className="relative w-full z-50" ref={dropdownRef}>
            <div
                className="genre flex items-center justify-between w-full p-2 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="block truncate">
                    {value.length > 0
                        ? `${value.length} selected`
                        : placeholder}
                </span>
                <ChevronDown
                    className="w-5 h-5 ml-2 -mr-1 text-gray-400"
                    aria-hidden="true"
                />
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
                        <input
                            type="text"
                            className="w-full p-2 text-sm border-none focus:ring-0"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex">
                        {/* <div className="w-10 bg-gray-100">
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  className="w-full p-1 text-xs text-gray-600 hover:bg-gray-200 focus:outline-none"
                  onClick={() => scrollToLetter(letter)}
                >
                  {letter}
                </button>
              ))}
            </div> */}
                        <div className="flex-grow overflow-y-auto max-h-60">
                            {Object.entries(filteredOptions).map(
                                ([letter, options]) => (
                                    <div key={letter} id={`group-${letter}`}>
                                        {/* <div className="sticky top-0 p-2 font-bold bg-gray-100">
                    {letter}
                  </div> */}
                                        {options.map((option) => (
                                            <label
                                                key={option.value}
                                                className="flex items-center p-2 hover:bg-gray-100"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                    checked={value.includes(
                                                        Number(option.value)
                                                    )}
                                                    onChange={() =>
                                                        handleGenreToggle(
                                                            Number(option.value)
                                                        )
                                                    }
                                                />
                                                <span className="ml-2">
                                                    {option.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {value.length > 0 && (
                <div className="flex flex-wrap mt-2">
                    {value.map((v) => {
                        const option = options.find(
                            (o) => Number(o.value) === v
                        );
                        return (
                            <span
                                key={v}
                                className="inline-flex items-center px-2 py-1 m-1 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md"
                            >
                                {option?.label}
                                <button
                                    type="button"
                                    className="flex-shrink-0 ml-1 text-indigo-400 hover:text-indigo-500 focus:outline-none"
                                    onClick={() => handleGenreToggle(v)}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AlphabeticalSelect;
