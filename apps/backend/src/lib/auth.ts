import jwt from "jsonwebtoken";
import { type TokenPayload, tokenPayloadSchema } from "@pizzaria/dtos";
import { config } from "../config.js";

export const signToken = (payload: TokenPayload): string =>
    jwt.sign(payload, config.JWT_SECRET, { expiresIn: "1h" });

export const verifyToken = (token: string): TokenPayload =>
    tokenPayloadSchema.parse(jwt.verify(token, config.JWT_SECRET));
