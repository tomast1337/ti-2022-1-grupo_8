import { Router } from "express";
import { localize, parseAcceptLanguage } from "../lib/localize.js";
import type { Repositories } from "../repositories/index.js";

/**
 * Read-only menu data, available to every authenticated user.
 *
 * Names and descriptions come back in the language of `Accept-Language`,
 * falling back to the default (English) text. `?raw=1` skips that and returns
 * the default text plus every translation, for the admin forms.
 */
export const catalogRoutes = (repos: Repositories) => {
    const router = Router();
    const respond =
        <T extends { name: string; description: string }>(
            list: () => Promise<(T & { translations?: object })[]>,
        ) =>
        async (
            req: {
                query: Record<string, unknown>;
                header(name: string): string | undefined;
            },
            res: { json(body: unknown): void },
        ) => {
            const items = await list();
            if (req.query.raw === "1") {
                res.json(items);
                return;
            }
            const languages = parseAcceptLanguage(
                req.header("accept-language"),
            );
            res.json(items.map((item) => localize(item as never, languages)));
        };

    router.get(
        "/ingredients",
        respond(() => repos.ingredients.list()),
    );
    router.get(
        "/pizzas",
        respond(() => repos.pizzas.list()),
    );
    router.get(
        "/products",
        respond(() => repos.products.list()),
    );
    return router;
};
