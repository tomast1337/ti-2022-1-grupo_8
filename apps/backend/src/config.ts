import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must have at least 16 chars"),
    /** Access tokens are short: the refresh cookie keeps the session alive. */
    JWT_EXPIRES_IN: z.string().default("15m"),
    REFRESH_TOKEN_DAYS: z.coerce.number().positive().default(7),
    /** A just-used refresh token is accepted again for this long (parallel tabs). */
    REFRESH_REUSE_GRACE_SECONDS: z.coerce.number().min(0).default(10),
    /** Set to true behind HTTPS. */
    COOKIE_SECURE: z.stringbool().default(false),
    /** Use "none" (with COOKIE_SECURE) only if the API and the site are on different domains. */
    COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
    /** Failed login/register attempts allowed per IP in the window below. */
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
    AUTH_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().positive().default(15),
    BACKEND_PORT: z.coerce.number().default(4518),
    CORS_ORIGIN: z.string().default("http://localhost:4517"),
    /** Where admin-uploaded images are stored and served from (/uploads). */
    UPLOADS_DIR: z.string().default("./uploads"),
});

export const config = envSchema.parse(process.env);
