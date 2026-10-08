import bcrypt from "bcrypt";
import { Router } from "express";
import { loginInputSchema, registerInputSchema } from "@pizzaria/dtos";
import { signToken } from "../lib/auth.js";
import { HttpError } from "../lib/errors.js";
import { parse } from "../lib/validate.js";
import type { Repositories } from "../repositories/index.js";

const SALT_ROUNDS = 10;
// compared against when the email is unknown, so a miss costs as much as a hit
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", SALT_ROUNDS);

export const authRoutes = (repos: Repositories) => {
    const router = Router();

    router.post("/login", async (req, res) => {
        const { email, password } = parse(loginInputSchema, req.body);
        const credentials = await repos.users.findCredentialsByEmail(email);
        // same message and same work for both failures so emails cannot be enumerated
        const valid = await bcrypt.compare(
            password,
            credentials?.passwordHash ?? DUMMY_HASH,
        );
        if (!credentials || !valid)
            throw new HttpError(401, "Invalid email or password");

        const { user } = credentials;
        const token = signToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        res.json({ token, user });
    });

    router.post("/register", async (req, res) => {
        const { name, email, password } = parse(registerInputSchema, req.body);
        if (await repos.users.findCredentialsByEmail(email)) {
            throw new HttpError(409, "Email already registered");
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
