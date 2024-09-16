"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatError = exports.removeImage = exports.getImageUrl = exports.generateRandom = exports.bytesToMb = exports.imageValidator = void 0;
const filesystem_1 = require("../config/filesystem");
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const imageValidator = (size, mime) => {
    if ((0, exports.bytesToMb)(size) > 2) {
        return "Image must be less than 2MB";
    }
    else if (!filesystem_1.supportedImageMimes.includes(mime)) {
        return "Image type should be img, jpg, png, etc.";
    }
    return null;
};
exports.imageValidator = imageValidator;
const bytesToMb = (bytes) => {
    return bytes / (1024 * 1024);
};
exports.bytesToMb = bytesToMb;
const generateRandom = () => {
    return (0, uuid_1.v4)();
};
exports.generateRandom = generateRandom;
const getImageUrl = (imgName) => {
    return `${process.env.APP_URL}news/${imgName}`;
};
exports.getImageUrl = getImageUrl;
const removeImage = (imgName) => {
    const path = `${process.cwd()}/public/news/${imgName}`;
    if (fs_1.default.existsSync(path)) {
        fs_1.default.unlinkSync(path);
    }
};
exports.removeImage = removeImage;
const formatError = (error) => {
    var _a;
    let errors = {};
    (_a = error.errors) === null || _a === void 0 ? void 0 : _a.map((issue) => {
        var _a;
        errors[(_a = issue.path) === null || _a === void 0 ? void 0 : _a[0]] = issue.message;
    });
    return errors;
};
exports.formatError = formatError;
