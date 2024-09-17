import express from "express";
import authRouter from "./authRoute";
import profileRouter from "./profileRoute";
import movieRouter from "./movieRoute";

const mainRouter = express.Router();

// Mount the routers on their respective paths
mainRouter.use(authRouter);
mainRouter.use(profileRouter);
mainRouter.use(movieRouter);

export default mainRouter;
