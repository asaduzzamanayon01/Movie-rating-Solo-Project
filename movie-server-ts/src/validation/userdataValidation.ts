import { z } from "zod";

// User registration validation schema with Zod
export const userSchemaValidation = z.object({
  firstName: z
    .string()
    .min(1, "First name must have at least 1 character")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name must have at least 1 character")
    .max(50, "Last name must not exceed 50 characters"),
  email: z.string().email("Invalid email address"),
  address: z
    .string()
    .min(1, "Address must have at least 1 character")
    .max(100, "Address must not exceed 100 characters"),
  password: z
    .string()
    .min(8, "Password must have at least 8 characters")
    .max(150, "Password must not exceed 150 characters"),
});

// User login validation schema with Zod
export const loginSchemaValidation = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must have at least 8 characters")
    .max(150, "Password must not exceed 150 characters"),
});

// Movie creation validation schema
export const createMovieSchema = z.object({
  title: z
    .string()
    .min(1, "Title must have at least 1 character")
    .max(100, "Title must not exceed 100 characters"),

  releaseDate: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z
      .number({
        required_error: "Release date is required",
        invalid_type_error: "Release date must be a valid number",
      })
      .min(1880, "Release date must be a valid year")
      .max(new Date().getFullYear(), "Release date cannot be in the future")
  ),

  type: z
    .string()
    .min(1, "Type must have at least 1 character")
    .max(50, "Type must not exceed 50 characters"),

  certificate: z
    .string()
    .max(20, "Certificate must not exceed 20 characters")
    .optional(),

  genres: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return Array.isArray(val) ? val.map(Number) : [];
  }, z.array(z.number()).nonempty("At least one genre must be selected")),
});

// Movie update validation schema with Zod and preprocessing
export const updateMovieSchema = z.object({
  title: z
    .string()
    .min(1, "Title must have at least 1 character")
    .max(100, "Title must not exceed 100 characters")
    .optional(),

  releaseDate: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z
      .number({
        invalid_type_error: "Release date must be a valid number",
      })
      .min(1880, "Release date must be a valid year")
      .max(new Date().getFullYear(), "Release date cannot be in the future")
      .optional()
  ),

  type: z
    .string()
    .min(1, "Type must have at least 1 character")
    .max(50, "Type must not exceed 50 characters")
    .optional(),

  certificate: z
    .string()
    .max(20, "Certificate must not exceed 20 characters")
    .optional(),

  genres: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return Array.isArray(val) ? val.map(Number) : [];
  }, z.array(z.number()).optional()),
});