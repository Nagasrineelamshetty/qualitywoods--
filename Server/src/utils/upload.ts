import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "quality-woods/products",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"],
  }),
});

export const upload = multer({ storage });