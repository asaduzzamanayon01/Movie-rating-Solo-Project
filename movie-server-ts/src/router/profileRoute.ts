import express, { RequestHandler } from "express";
import { index } from "../controller/profileController";
import authMiddleware from "../authenticate/authenticate";

const typedAuthMiddleware: RequestHandler =
  authMiddleware as unknown as RequestHandler;
const typedIndex: RequestHandler = index as unknown as RequestHandler;

const profileRouter = express.Router();

profileRouter.get("/", typedAuthMiddleware, typedIndex);

export default profileRouter;
