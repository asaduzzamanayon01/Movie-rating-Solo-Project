import { supportedImageMimes } from "../config/filesystem";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { ZodError } from "zod";

export const imageValidator = (size: number, mime: string): string | null => {
  if (bytesToMb(size) > 2) {
    return "Image must be less than 2MB";
  } else if (!supportedImageMimes.includes(mime)) {
    return "Image type should be img, jpg, png, etc.";
  }
  return null;
};

// Test
export const bytesToMb = (bytes: number): number => {
  return bytes / (1024 * 1024);
};

export const generateRandom = (): string => {
  return uuidv4();
};

// Test
export const getImageUrl = (imgName: string): string => {
  return `${process.env.APP_URL}news/${imgName}`;
};

export const removeImage = (imgName: string): void => {
  const path = `${process.cwd()}/public/news/${imgName}`;
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};

export const formatError = (error: ZodError): any => {
  let errors: any = {};
  error.errors?.map((issue) => {
    errors[issue.path?.[0]] = issue.message;
  });

  return errors;
};
