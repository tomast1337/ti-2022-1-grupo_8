import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must have at least 16 chars"),
    JWT_EXPIRES_IN: z.string().default("1h"),
    /** Failed login/register attempts allowed per IP in the window below. */
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
    AUTH_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().positive().default(15),
    BACKEND_PORT: z.coerce.number().default(4518),
    CORS_ORIGIN: z.string().default("http://localhost:4517"),
    /** Where admin-uploaded images are stored and served from (/uploads). */
    UPLOADS_DIR: z.string().default("./uploads"),
});

export const config = envSchema.parse(process.env);
