import { Router } from "express";
import { placeOrderInputSchema } from "@pizzaria/dtos";
import { currentUser } from "../middleware/auth.js";
import { parse } from "../lib/validate.js";
import type { Repositories } from "../repositories/index.js";
import { placeOrder } from "../services/orders.js";

export const customerRoutes = (repos: Repositories) => {
    const router = Router();

    router.get("/orders", async (req, res) => {
        res.json(await repos.orders.listByUserEmail(currentUser(req).email));
    });

    router.post("/orders", async (req, res) => {
        const input = parse(placeOrderInputSchema, req.body);
        res.status(201).json(await placeOrder(repos, currentUser(req), input));
    });

    return router;
};
