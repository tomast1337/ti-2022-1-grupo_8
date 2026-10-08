import { afterEach, describe, expect, it, vi } from "vitest";
import { refreshSession } from "./refresh";

const session = {
    token: "t",
    user: {
        id: "5f0c2b7e-6a0b-4f0e-9a52-0d3c1c1f6b11",
        name: "Ana",
        email: "ana@example.com",
        role: "customer",
    },
};

describe("refreshSession", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("shares one request between parallel callers (tokens rotate)", async () => {
        const fetchMock = vi.fn(async () => Response.json(session));
        vi.stubGlobal("fetch", fetchMock);
        const [a, b] = await Promise.all([refreshSession(), refreshSession()]);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(a).toEqual(session);
        expect(b).toEqual(session);
        // the next refresh, later, is a new request
        await refreshSession();
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("sends the cookie and the CSRF header", async () => {
        const fetchMock = vi.fn(async () => Response.json(session));
        vi.stubGlobal("fetch", fetchMock);
        await refreshSession();
        const [, init] = fetchMock.mock.calls[0] as unknown as [
            string,
            RequestInit,
        ];
        expect(init.credentials).toBe("include");
        expect(init.headers).toMatchObject({ "x-requested-by": "pizzaria" });
    });

    it("returns null without a valid session", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => new Response("{}", { status: 401 })),
        );
        expect(await refreshSession()).toBeNull();
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => Response.json({ nope: 1 })),
        );
        expect(await refreshSession()).toBeNull();
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => {
                throw new Error("offline");
            }),
        );
        expect(await refreshSession()).toBeNull();
    });
});
