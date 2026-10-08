import express from "express";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { authRateLimit } from "./rate-limit.js";

describe("authRateLimit", () => {
    let server: ReturnType<express.Express["listen"]>;
    let url = "";

    beforeAll(async () => {
        const app = express();
        app.use(authRateLimit(3, 15));
        // "ok" succeeds, anything else fails like a wrong password would
        app.post("/login/:outcome", (req, res) => {
            res.status(req.params.outcome === "ok" ? 200 : 401).json({});
        });
        await new Promise<void>((resolve) => {
            server = app.listen(0, () => resolve());
        });
        url = `http://localhost:${(server.address() as AddressInfo).port}`;
    });
    afterAll(() => server.close());

    const post = (outcome: string) =>
        fetch(`${url}/login/${outcome}`, { method: "POST" });

    it("lets successful logins through without counting them", async () => {
        for (let i = 0; i < 6; i++) {
            expect((await post("ok")).status).toBe(200);
        }
    });

    it("blocks an IP after too many failures", async () => {
        for (let i = 0; i < 3; i++) {
            expect((await post("bad")).status).toBe(401);
        }
        const blocked = await post("bad");
        expect(blocked.status).toBe(429);
        expect(await blocked.json()).toEqual({
            error: "Too many attempts, try again later",
        });
        // even a correct login waits out the window
        expect((await post("ok")).status).toBe(429);
    });
});
