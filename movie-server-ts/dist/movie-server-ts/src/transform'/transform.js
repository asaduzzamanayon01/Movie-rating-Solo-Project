"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movieTransform = void 0;
const helper_1 = require("../utils/helper");
const movieTransform = (movie) => {
    var _a, _b, _c;
    return {
        id: movie.id,
        title: movie.title,
        image: (0, helper_1.getImageUrl)(movie.image),
        releaseDate: (_a = movie.releaseDate) !== null && _a !== void 0 ? _a : 2022,
        duration: (_b = movie.duration) !== null && _b !== void 0 ? _b : undefined, // Convert null to undefined
        genres: ((_c = movie.genres) === null || _c === void 0 ? void 0 : _c.map((genre) => genre.name)) || [], // Map genre objects to their names
    };
};
exports.movieTransform = movieTransform;
