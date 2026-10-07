import { Router } from "express";
import type { Repositories } from "../repositories/index.js";

/** Read-only menu data, available to every authenticated user. */
export const catalogRoutes = (repos: Repositories) => {
    const router = Router();
    router.get("/ingredients", async (_req, res) =>
        res.json(await repos.ingredients.list()),
    );
    router.get("/pizzas", async (_req, res) =>
        res.json(await repos.pizzas.list()),
    );
    router.get("/products", async (_req, res) =>
        res.json(await repos.products.list()),
    );
    return router;
};
