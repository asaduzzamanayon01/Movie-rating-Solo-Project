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
exports.index = void 0;
const db_config_1 = __importDefault(require("../DB/db.config"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = req.user;
    const foundUser = yield db_config_1.default.user.findUnique({
        where: { email: user.email },
    });
    if (!foundUser) {
        return res.status(404).json({ status: 404, message: "User not found" });
    }
    return res.json({ status: 200, user: foundUser });
});
exports.index = index;
const ensureDirectoryExistence = (filePath) => {
    const dir = path_1.default.dirname(filePath);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
// // Update your update function
// export const update = async (
//   req: AuthenticatedRequest,
//   res: Response
// ): Promise<Response> => {
//   const { id } = req.params;
//   const user = req.user;
//   if (!req.files || !req.files.profile) {
//     return res.status(400).json({ messages: "Profile image required" });
//   }
//   const profile = req.files.profile;
//   try {
//     const validationMessages = await imageValidator(
//       profile.size,
//       profile.mimetype
//     );
//     if (validationMessages !== null) {
//       return res.status(400).json({ messages: validationMessages });
//     }
//     const imgExt = profile.name.split(".").pop();
//     if (!imgExt) {
//       return res.status(400).json({ messages: "Invalid file extension" });
//     }
//     const imageName = `${generateRandom()}.${imgExt}`;
//     const uploadPath = path.join(process.cwd(), "public", "images", imageName);
//     // Ensure the directory exists
//     ensureDirectoryExistence(uploadPath);
//     await new Promise<void>((resolve, reject) => {
//       profile.mv(uploadPath, (err) => {
//         if (err) {
//           console.error("Error during file upload:", err);
//           reject(err);
//         } else {
//           resolve();
//         }
//       });
//     });
//     // const updatedUser = await prisma.user.update({
//     //   where: { id: parseInt(id) }, // Ensure id is converted to number
//     //   data: { profile: imageName } // Update profile image field
//     // });
//     return res.json({
//       name: profile.name,
//       size: profile.size,
//       mime: profile.mimetype,
//     });
//   } catch (err) {
//     console.error("Error in update function:", err);
//     return res.status(500).json({ messages: "Error uploading file" });
//   }
// };
