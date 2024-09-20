"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movieTransform = void 0;
const helper_1 = require("../utils/helper");
const movieTransform = (movie) => {
    var _a, _b;
    return {
        id: movie.id,
        title: movie.title,
        image: (0, helper_1.getImageUrl)(movie.image),
        releaseDate: movie.releaseDate,
        duration: (_a = movie.duration) !== null && _a !== void 0 ? _a : undefined, // Convert null to undefined
        genres: ((_b = movie.genres) === null || _b === void 0 ? void 0 : _b.map((genre) => genre.name)) || [], // Map genre objects to their names
    };
};
exports.movieTransform = movieTransform;
