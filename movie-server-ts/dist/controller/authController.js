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
exports.login = exports.register = void 0;
const db_config_1 = __importDefault(require("../DB/db.config"));
const userdataValidation_1 = require("../validation/userdataValidation");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        // Zod validation
        const result = userdataValidation_1.userSchemaValidation.safeParse(body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }
        const payload = result.data;
        // Check if user already exists
        const findUser = yield db_config_1.default.user.findUnique({
            where: {
                email: payload.email,
            },
        });
        if (findUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        // Hash password once (removed the double hashing)
        const hashedPassword = bcrypt_1.default.hashSync(payload.password, 10);
        // Create new user
        const newUser = yield db_config_1.default.user.create({
            data: {
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
                phone: body.phone, // Assuming this is validated elsewhere
                address: payload.address,
                password: hashedPassword,
            },
        });
        return res.status(201).json({ message: "Successfully created user" });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        // Zod validation
        const result = userdataValidation_1.loginSchemaValidation.safeParse(body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }
        const payload = result.data;
        // Find user with email
        const findUser = yield db_config_1.default.user.findUnique({
            where: {
                email: payload.email,
            },
        });
        // Return the same error message to avoid leaking info about registered emails
        if (!findUser || !bcrypt_1.default.compareSync(payload.password, findUser.password)) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Generate JWT token with both email and user id
        const token = jsonwebtoken_1.default.sign({ id: findUser.id, email: payload.email }, // Including user id for easier access later
        process.env.JWT_SECRET, { expiresIn: "30d" });
        return res.json({
            status: 200,
            message: "Login successful",
            access_token: `Bearer ${token}`,
            user: {
                id: findUser.id,
                email: findUser.email,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.login = login;
