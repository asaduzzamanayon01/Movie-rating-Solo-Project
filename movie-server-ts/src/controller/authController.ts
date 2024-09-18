import { Request, Response } from "express";
import { ZodError } from "zod";
import prisma from "../DB/db.config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { formatError } from "../utils/helper";
import {
  loginSchemaValidation,
  userSchemaValidation,
} from "../validation/userdataValidation";

export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const body = req.body;
    const result = userSchemaValidation.safeParse(body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const payload = result.data;

    const findUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (findUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = bcrypt.hashSync(payload.password, 10);

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
    const result = loginSchemaValidation.safeParse(body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const payload = result.data;

    const findUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!findUser || !bcrypt.compareSync(payload.password, findUser.password)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: findUser.id, email: payload.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: "lax",
    });

    res.cookie("userId", findUser.id, {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    return res.json({
      status: 200,
      message: "Login successful",
      token,
      user: {
        id: findUser.id,
        email: findUser.email,
        firstName: findUser.firstName,
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

export const logout = (req: Request, res: Response): Response => {
  res.clearCookie("token");
  res.clearCookie("userId");
  return res.json({ message: "Logged out successfully" });
};
