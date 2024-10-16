"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const db_config_1 = __importDefault(require("../DB/db.config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helper_1 = require("../utils/helper");
const userdataValidation_1 = require("../validation/userdataValidation");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const result = userdataValidation_1.userSchemaValidation.safeParse(body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }
        const payload = result.data;
        const findUser = yield db_config_1.default.user.findUnique({
            where: { email: payload.email },
        });
        if (findUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const hashedPassword = bcrypt_1.default.hashSync(payload.password, 10);
        const newUser = yield db_config_1.default.user.create({
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
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = (0, helper_1.formatError)(error);
            return res.status(422).json({
                message: "Invalid data",
                errors,
            });
        }
        else {
            return res.status(500).json({ message: "Something wrong" });
        }
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const result = userdataValidation_1.loginSchemaValidation.safeParse(body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }
        const payload = result.data;
        const findUser = yield db_config_1.default.user.findUnique({
            where: { email: payload.email },
        });
        if (!findUser || !bcrypt_1.default.compareSync(payload.password, findUser.password)) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: findUser.id, email: payload.email }, process.env.JWT_SECRET, { expiresIn: "30d" });
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
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = (0, helper_1.formatError)(error);
            return res.status(422).json({ message: "Invalid data", errors });
        }
        else {
            return res.status(500).json({ message: "Something wrong" });
        }
    }
});
exports.login = login;
const logout = (req, res) => {
    res.clearCookie("token");
    res.clearCookie("userId");
    return res.json({ message: "Logged out successfully" });
};
exports.logout = logout;
