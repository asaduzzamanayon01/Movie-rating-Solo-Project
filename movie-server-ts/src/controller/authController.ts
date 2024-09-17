import { Request, Response } from "express";
import { ZodError } from "zod";
import prisma from "../DB/db.config";
import {
  loginSchemaValidation,
  userSchemaValidation,
} from "../validation/userdataValidation";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { formatError } from "../utils/helper";

export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const body = req.body;

    // Zod validation
    const result = userSchemaValidation.safeParse(body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const payload = result.data;

    // Check if user already exists
    const findUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (findUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password once (removed the double hashing)
    const hashedPassword = bcrypt.hashSync(payload.password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ message: "Successfully created user" });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const errors = formatError(error);
      return res.status(422).json({
        message: "Invalid data",
        errors,
      });
    } else {
      return res.status(500).json({ message: "Something wrong" });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body;

    // Zod validation
    const result = loginSchemaValidation.safeParse(body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const payload = result.data;

    // Find user with email
    const findUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    // Return the same error message to avoid leaking info about registered emails
    if (!findUser || !bcrypt.compareSync(payload.password, findUser.password)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token with both email and user id
    const token = jwt.sign(
      { id: findUser.id, email: payload.email }, // Including user id for easier access later
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );

    return res.json({
      status: 200,
      message: "Login successful",
      access_token: `Bearer ${token}`,
      user: {
        id: findUser.id,
        email: findUser.email,
      },
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const errors = formatError(error);
      return res.status(422).json({ message: "Invalid data", errors });
    } else {
      return res.status(500).json({ message: "Something wrong" });
    }
  }
};
