import { rateLimit } from "express-rate-limit";

/**
 * Throttles brute-force attempts on the public auth routes. Only failed
 * requests count, so normal logins never run into it.
 */
export const authRateLimit = (max: number, windowMinutes: number) =>
    rateLimit({
        windowMs: windowMinutes * 60_000,
        limit: max,
        skipSuccessfulRequests: true,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        message: { error: "Too many attempts, try again later" },
    });
