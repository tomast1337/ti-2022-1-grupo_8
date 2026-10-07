import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";

export const uploadsDir = path.resolve(config.UPLOADS_DIR);

const EXTENSIONS: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
};

export const isAllowedImage = (mimetype: string) => mimetype in EXTENSIONS;

/** Stores an uploaded image and returns the public URL path. */
export const saveImage = async (file: Express.Multer.File): Promise<string> => {
    const extension = EXTENSIONS[file.mimetype];
    if (!extension) throw new Error(`Unsupported image type ${file.mimetype}`);
    await mkdir(uploadsDir, { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    await writeFile(path.join(uploadsDir, filename), file.buffer);
    return `/uploads/${filename}`;
};

/** Removes a previously uploaded image. Seed images (/imgs/...) are never touched. */
export const deleteImage = async (url: string): Promise<void> => {
    if (!url.startsWith("/uploads/")) return;
    const file = path.join(uploadsDir, path.basename(url));
    await unlink(file).catch(() => undefined);
};
