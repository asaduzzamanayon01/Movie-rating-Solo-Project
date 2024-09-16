"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movieTransform = void 0;
const helper_1 = require("../utils/helper");
const movieTransform = (movie) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return {
        id: movie.id,
        title: movie.title,
        image: (0, helper_1.getImageUrl)(movie.image),
        releaseDate: movie.releaseDate,
        votes: (_a = movie.votes) !== null && _a !== void 0 ? _a : undefined, // Convert null to undefined
        duration: (_b = movie.duration) !== null && _b !== void 0 ? _b : undefined, // Convert null to undefined
        type: movie.type,
        certificate: (_c = movie.certificate) !== null && _c !== void 0 ? _c : undefined,
        episodes: (_d = movie.episodes) !== null && _d !== void 0 ? _d : undefined, // Convert null to undefined
        nudity: (_e = movie.nudity) !== null && _e !== void 0 ? _e : undefined,
        violence: (_f = movie.violence) !== null && _f !== void 0 ? _f : undefined,
        profanity: (_g = movie.profanity) !== null && _g !== void 0 ? _g : undefined,
        alcohol: (_h = movie.alcohol) !== null && _h !== void 0 ? _h : undefined,
        frightening: (_j = movie.frightening) !== null && _j !== void 0 ? _j : undefined,
        genres: ((_k = movie.genres) === null || _k === void 0 ? void 0 : _k.map((genre) => genre.name)) || [], // Map genre objects to their names
    };
};
exports.movieTransform = movieTransform;
