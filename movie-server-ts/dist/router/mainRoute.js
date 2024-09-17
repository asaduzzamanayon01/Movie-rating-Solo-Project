"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRoute_1 = __importDefault(require("./authRoute"));
const profileRoute_1 = __importDefault(require("./profileRoute"));
const movieRoute_1 = __importDefault(require("./movieRoute"));
const mainRouter = express_1.default.Router();
// Mount the routers on their respective paths
mainRouter.use(authRoute_1.default);
mainRouter.use(profileRoute_1.default);
mainRouter.use(movieRoute_1.default);
exports.default = mainRouter;
