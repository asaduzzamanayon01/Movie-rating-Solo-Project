import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../DB/db.config";
import { User } from "@prisma/client"; // Import User type from @prisma/client

interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string }; // Store user id and email
}

const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1]; // Extract token

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Internal server error" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Attach the user info to the request object
    req.user = {
      id: decoded.id as number,
      email: decoded.email as string,
    };

    next(); // Pass control to the next middleware
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
