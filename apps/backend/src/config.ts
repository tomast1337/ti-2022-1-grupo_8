import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must have at least 16 chars"),
    BACKEND_PORT: z.coerce.number().default(3001),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),
    /** Where admin-uploaded images are stored and served from (/uploads). */
    UPLOADS_DIR: z.string().default("./uploads"),
});

export const config = envSchema.parse(process.env);
