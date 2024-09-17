"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMovieSchema = exports.createMovieSchema = exports.loginSchemaValidation = exports.userSchemaValidation = void 0;
const zod_1 = require("zod");
// User registration validation schema with Zod
exports.userSchemaValidation = zod_1.z
    .object({
    firstName: zod_1.z
        .string()
        .min(1, "First name must have at least 1 character")
        .max(50, "First name must not exceed 50 characters"),
    lastName: zod_1.z
        .string()
        .min(1, "Last name must have at least 1 character")
        .max(50, "Last name must not exceed 50 characters"),
    email: zod_1.z.string().email("Invalid email address"),
    address: zod_1.z
        .string()
        .min(1, "Address must have at least 1 character")
        .max(100, "Address must not exceed 100 characters"),
    phone: zod_1.z.string().max(20, "phone number required").optional(),
    password: zod_1.z
        .string()
        .min(8, "Password must have at least 8 characters")
        .max(150, "Password must not exceed 150 characters"),
    confirm_password: zod_1.z
        .string()
        .min(8, "Confirm password must have at least 8 characters")
        .max(150, "Confirm password must not exceed 150 characters"),
})
    .refine((data) => data.password === data.confirm_password, {
    message: "Confirm password not matched",
    path: ["confirm_password"],
});
// User login validation schema with Zod
exports.loginSchemaValidation = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z
        .string()
        .min(8, "Password must have at least 8 characters")
        .max(150, "Password must not exceed 150 characters"),
});
// Movie creation validation schema
exports.createMovieSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, "Title must have at least 1 character")
        .max(100, "Title must not exceed 100 characters"),
    releaseDate: zod_1.z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z
        .number({
        required_error: "Release date is required",
        invalid_type_error: "Release date must be a valid number",
    })
        .min(1880, "Release date must be a valid year")
        .max(new Date().getFullYear(), "Release date cannot be in the future")),
    type: zod_1.z
        .string()
        .min(1, "Type must have at least 1 character")
        .max(50, "Type must not exceed 50 characters"),
    certificate: zod_1.z
        .string()
        .max(20, "Certificate must not exceed 20 characters")
        .optional(),
    genres: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            try {
                return JSON.parse(val);
            }
            catch (_a) {
                return [];
            }
        }
        return Array.isArray(val) ? val.map(Number) : [];
    }, zod_1.z.array(zod_1.z.number()).nonempty("At least one genre must be selected")),
});
// Movie update validation schema with Zod and preprocessing
exports.updateMovieSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, "Title must have at least 1 character")
        .max(100, "Title must not exceed 100 characters")
        .optional(),
    releaseDate: zod_1.z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z
        .number({
        invalid_type_error: "Release date must be a valid number",
    })
        .min(1880, "Release date must be a valid year")
        .max(new Date().getFullYear(), "Release date cannot be in the future")
        .optional()),
    type: zod_1.z
        .string()
        .min(1, "Type must have at least 1 character")
        .max(50, "Type must not exceed 50 characters")
        .optional(),
    certificate: zod_1.z
        .string()
        .max(20, "Certificate must not exceed 20 characters")
        .optional(),
    genres: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            try {
                return JSON.parse(val);
            }
            catch (_a) {
                return [];
            }
        }
        return Array.isArray(val) ? val.map(Number) : [];
    }, zod_1.z.array(zod_1.z.number()).optional()),
});
