import { Router } from "express";
import { orderStatusSchema } from "@pizzaria/dtos";
import { parse, uuidParam } from "../lib/validate.js";
import type { Repositories } from "../repositories/index.js";
import { advanceOrder } from "../services/orders.js";

export const employeeRoutes = (repos: Repositories) => {
    const router = Router();

    // GET /employee/orders?status=placed|in_progress|completed
    router.get("/orders", async (req, res) => {
        const status = req.query.status
            ? parse(orderStatusSchema, req.query.status)
            : undefined;
        res.json(await repos.orders.list(status));
    });

    router.post("/orders/:id/start", async (req, res) => {
        res.json(await advanceOrder(repos, uuidParam(req.params.id), "placed"));
    });

    router.post("/orders/:id/complete", async (req, res) => {
        res.json(
            await advanceOrder(repos, uuidParam(req.params.id), "in_progress"),
        );
    });

    return router;
};
