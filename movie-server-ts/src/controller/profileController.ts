import { Request, Response } from "express";
import prisma from "../DB/db.config";
import { generateRandom, imageValidator } from "../utils/helper";
import { UploadedFile } from "express-fileupload"; // Import UploadedFile type from express-fileupload
import fs from "fs";
import path from "path";

interface AuthenticatedRequest extends Request {
  user: {
    email: string;
  };
}

export const index = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  let user = req.user;

  const foundUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!foundUser) {
    return res.status(404).json({ status: 404, message: "User not found" });
  }

  return res.json({ status: 200, user: foundUser });
};
const ensureDirectoryExistence = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
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
