import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { Router, type Response } from "express";
import {
    loginInputSchema,
    registerInputSchema,
    type User,
} from "@pizzaria/dtos";
import { signToken } from "../lib/auth.js";
import { config } from "../config.js";
import { HttpError } from "../lib/errors.js";
import {
    clearRefreshCookie,
    hashRefreshToken,
    newRefreshToken,
    readRefreshCookie,
    refreshExpiry,
    setRefreshCookie,
} from "../lib/refresh-token.js";
import { parse } from "../lib/validate.js";
import type { Repositories } from "../repositories/index.js";

const SALT_ROUNDS = 10;

const accessTokenFor = (user: User) =>
    signToken({ id: user.id, email: user.email, role: user.role });
// compared against when the email is unknown, so a miss costs as much as a hit
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", SALT_ROUNDS);

/**
 * Cookie-based routes need a header that a cross-site form cannot send
 * (it forces a CORS preflight), which blocks CSRF on top of SameSite.
 */
const requireCsrfHeader = (header: string | undefined) => {
    if (header !== "pizzaria")
        throw new HttpError(403, "Missing CSRF header", "csrf");
};

export const authRoutes = (repos: Repositories) => {
    const router = Router();

    /** Starts or continues a login: new refresh cookie plus a short access token. */
    const issueSession = async (
        res: Response,
        user: User,
        familyId: string,
    ) => {
        const refreshToken = newRefreshToken();
        const expiresAt = refreshExpiry();
        await repos.refreshTokens.create({
            userId: user.id,
            familyId,
            tokenHash: hashRefreshToken(refreshToken),
            expiresAt,
        });
        setRefreshCookie(res, refreshToken, expiresAt);
        res.json({ token: accessTokenFor(user), user });
    };

    router.post("/login", async (req, res) => {
        const { email, password } = parse(loginInputSchema, req.body);
        const credentials = await repos.users.findCredentialsByEmail(email);
        // same message and same work for both failures so emails cannot be enumerated
        const valid = await bcrypt.compare(
            password,
            credentials?.passwordHash ?? DUMMY_HASH,
        );
        if (!credentials || !valid)
            throw new HttpError(
                401,
                "Invalid email or password",
                "invalid_credentials",
            );

        await issueSession(res, credentials.user, randomUUID());
    });

    router.post("/refresh", async (req, res) => {
        requireCsrfHeader(req.header("x-requested-by"));
        const raw = readRefreshCookie(req);
        if (!raw)
            throw new HttpError(401, "No refresh token", "no_refresh_token");

        const tokenHash = hashRefreshToken(raw);
        let stored = await repos.refreshTokens.findByHash(tokenHash);
        if (!stored) {
            clearRefreshCookie(res);
            throw new HttpError(
                401,
                "Invalid refresh token",
                "invalid_refresh_token",
            );
        }
        if (stored.expiresAt.getTime() < Date.now()) {
            await repos.refreshTokens.revokeFamily(stored.familyId);
            clearRefreshCookie(res);
            throw new HttpError(
                401,
                "Refresh token expired",
                "refresh_token_expired",
            );
        }
        const user = await repos.users.findById(stored.userId);
        if (!user) {
            clearRefreshCookie(res);
            throw new HttpError(
                401,
                "Invalid refresh token",
                "invalid_refresh_token",
            );
        }

        if (!(await repos.refreshTokens.markUsed(stored.id))) {
            // already exchanged: a parallel tab (fine) or a stolen copy (not fine)
            stored =
                (await repos.refreshTokens.findByHash(tokenHash)) ?? stored;
            const usedAgo = stored.usedAt
                ? Date.now() - stored.usedAt.getTime()
                : 0;
            if (usedAgo <= config.REFRESH_REUSE_GRACE_SECONDS * 1000) {
                // the winner's new cookie is already in the browser: just mint an access token
                res.json({ token: accessTokenFor(user), user });
                return;
            }
            await repos.refreshTokens.revokeFamily(stored.familyId);
            clearRefreshCookie(res);
            throw new HttpError(
                401,
                "Refresh token reuse detected",
                "refresh_token_reused",
            );
        }

        await issueSession(res, user, stored.familyId);
    });

    router.post("/logout", async (req, res) => {
        requireCsrfHeader(req.header("x-requested-by"));
        const raw = readRefreshCookie(req);
        const stored =
            raw &&
            (await repos.refreshTokens.findByHash(hashRefreshToken(raw)));
        if (stored) await repos.refreshTokens.revokeFamily(stored.familyId);
        clearRefreshCookie(res);
        res.status(204).end();
    });

    router.post("/register", async (req, res) => {
        const { name, email, password } = parse(registerInputSchema, req.body);
        if (await repos.users.findCredentialsByEmail(email)) {
            throw new HttpError(409, "Email already registered", "email_taken");
        }
        const user = await repos.users.create({
            name,
            email,
            passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
        });
        res.status(201).json(user);
    });

    return router;
};
