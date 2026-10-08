import multer from "multer";
import { HttpError } from "../lib/errors.js";
import { isAllowedImage } from "../lib/storage.js";

/** Accepts one optional `image` file (png/jpeg/webp, up to 5 MB). */
export const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, callback) => {
        if (isAllowedImage(file.mimetype)) callback(null, true);
        else
            callback(
                new HttpError(
                    400,
                    "Image must be png, jpeg or webp",
                    "invalid_image",
                ),
            );
    },
}).single("image");
