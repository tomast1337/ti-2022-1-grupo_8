import { Router } from "express";
import { placeOrderInputSchema } from "@pizzaria/dtos";
import { currentUser } from "../middleware/auth.js";
import { parse } from "../lib/validate.js";
import type { Repositories } from "../repositories/index.js";
import { parseAcceptLanguage } from "../lib/localize.js";
import { localizeOrders, placeOrder } from "../services/orders.js";

const languages = (req: { header(name: string): string | undefined }) =>
    parseAcceptLanguage(req.header("accept-language"));

export const customerRoutes = (repos: Repositories) => {
    const router = Router();

    router.get("/orders", async (req, res) => {
        res.json(
            await localizeOrders(
                repos,
                await repos.orders.listByUserEmail(currentUser(req).email),
                languages(req),
            ),
        );
    });

    router.post("/orders", async (req, res) => {
        const input = parse(placeOrderInputSchema, req.body);
        const [order] = await localizeOrders(
            repos,
            [await placeOrder(repos, currentUser(req), input)],
            languages(req),
        );
        res.status(201).json(order);
    });

    return router;
};
