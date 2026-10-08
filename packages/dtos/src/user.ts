import { z } from "zod";
import { emailSchema, idSchema } from "./common.js";

export const roleSchema = z.enum(["customer", "admin", "employee"]);
export type Role = z.infer<typeof roleSchema>;

export const userSchema = z.object({
    id: idSchema,
    name: z.string().min(1),
    email: emailSchema,
    role: roleSchema,
});
export type User = z.infer<typeof userSchema>;

export const registerInputSchema = z.object({
    name: z.string().min(1),
    email: emailSchema,
    // bcrypt only reads the first 72 bytes, so longer passwords are refused
    password: z.string().min(8).max(72),
});
export type RegisterInput = z.infer<typeof registerInputSchema>;

export const loginInputSchema = z.object({
    email: emailSchema,
    password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const loginResponseSchema = z.object({
    token: z.string(),
    user: userSchema,
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

/** Claims stored inside the JWT. */
export const tokenPayloadSchema = z.object({
    id: idSchema,
    email: emailSchema,
    role: roleSchema,
});
export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
