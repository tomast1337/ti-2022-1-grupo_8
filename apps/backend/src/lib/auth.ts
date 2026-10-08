import jwt from "jsonwebtoken";
import { type TokenPayload, tokenPayloadSchema } from "@pizzaria/dtos";
import { config } from "../config.js";

// pinned so a token can never pick its own (or "none") algorithm
const ALGORITHM = "HS256";

export const signToken = (payload: TokenPayload): string =>
    jwt.sign(payload, config.JWT_SECRET, {
        algorithm: ALGORITHM,
        expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

export const verifyToken = (token: string): TokenPayload =>
    tokenPayloadSchema.parse(
        jwt.verify(token, config.JWT_SECRET, { algorithms: [ALGORITHM] }),
    );
