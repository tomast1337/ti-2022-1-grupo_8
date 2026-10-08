import type { Request } from "express";
import { beforeAll, describe, expect, it } from "vitest";
import type { Role, User } from "@pizzaria/dtos";

const ID = "5f0c2b7e-6a0b-4f0e-9a52-0d3c1c1f6b11";

let signToken: typeof import("../lib/auth.js").signToken;
let authenticate: typeof import("./auth.js").authenticate;

beforeAll(async () => {
    process.env.DATABASE_URL = "postgres://unused";
    process.env.JWT_SECRET = "test-secret-with-enough-length";
    ({ signToken } = await import("../lib/auth.js"));
    ({ authenticate } = await import("./auth.js"));
});

const user = (role: Role): User => ({
    id: ID,
    name: "Ana",
    email: "ana@example.com",
    role,
});

/** Runs the middleware and returns the request it filled in, or the error it threw. */
const run = async (token: string | undefined, stored: User | undefined) => {
    const req = {
        header: (name: string) =>
            name === "authorization" && token ? `Bearer ${token}` : undefined,
    } as unknown as Request;
    const middleware = authenticate({ findById: async () => stored });
    try {
        await middleware(req, {} as never, () => undefined);
        return { req };
    } catch (error) {
        return { error: error as { status?: number; message: string } };
    }
};

describe("authenticate", () => {
    const token = () =>
        signToken({ id: ID, email: "ana@example.com", role: "customer" });

    it("accepts a valid token for an existing user", async () => {
        const { req } = await run(token(), user("customer"));
        expect(req?.user).toEqual({
            id: ID,
            email: "ana@example.com",
            role: "customer",
        });
    });

    it("uses the role stored in the database, not the one in the token", async () => {
        const { req } = await run(token(), user("employee"));
        expect(req?.user?.role).toBe("employee");
    });

    it("locks out a user deleted after the token was issued", async () => {
        const { error } = await run(token(), undefined);
        expect(error?.status).toBe(401);
    });

    it("refuses a missing or malformed token", async () => {
        expect((await run(undefined, user("customer"))).error?.status).toBe(
            401,
        );
        expect((await run("garbage", user("customer"))).error?.status).toBe(
            401,
        );
    });
});
