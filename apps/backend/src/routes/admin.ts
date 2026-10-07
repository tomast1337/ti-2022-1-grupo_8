import { Router } from "express";
import { z } from "zod";
import {
    ingredientInputSchema,
    pizzaInputSchema,
    productInputSchema,
    reportQuerySchema,
    roleSchema,
} from "@pizzaria/dtos";
import { HttpError, notFound } from "../lib/errors.js";
import { deleteImage, saveImage } from "../lib/storage.js";
import { parse, uuidParam } from "../lib/validate.js";
import { currentUser } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";
import type { Repositories } from "../repositories/index.js";
import { generateReport } from "../services/reports.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export const adminRoutes = (repos: Repositories) => {
    const router = Router();

    /* ---------- users ---------- */

    router.get("/users", async (_req, res) =>
        res.json(await repos.users.list()),
    );

    router.get("/users/:id", async (req, res) => {
        const user = await repos.users.findById(uuidParam(req.params.id));
        if (!user) throw notFound("User");
        res.json({
            ...user,
            orders: await repos.orders.listByUserEmail(user.email),
        });
    });

    router.patch("/users/:id/role", async (req, res) => {
        const { role } = parse(z.object({ role: roleSchema }), req.body);
        const id = uuidParam(req.params.id);
        if (id === currentUser(req).id && role !== "admin") {
            throw new HttpError(400, "You cannot remove your own admin role");
        }
        const user = await repos.users.updateRole(id, role);
        if (!user) throw notFound("User");
        res.json(user);
    });

    router.delete("/users/:id", async (req, res) => {
        const id = uuidParam(req.params.id);
        if (id === currentUser(req).id) {
            throw new HttpError(400, "You cannot delete your own account");
        }
        const user = await repos.users.remove(id);
        if (!user) throw notFound("User");
        res.json(user);
    });

    /* ---------- ingredients ---------- */

    router.post("/ingredients", uploadImage, async (req, res) => {
        const input = parse(ingredientInputSchema, req.body);
        const image = req.file && (await saveImage(req.file));
        const created = await repos.ingredients.create({ ...input, image });
        res.status(201).json(created);
    });

    router.put("/ingredients/:id", uploadImage, async (req, res) => {
        const id = uuidParam(req.params.id);
        const input = parse(ingredientInputSchema, req.body);
        const previous = await repos.ingredients.findById(id);
        if (!previous) throw notFound("Ingredient");
        const image = req.file && (await saveImage(req.file));
        const updated = await repos.ingredients.update(id, { ...input, image });
        if (image) await deleteImage(previous.image);
        res.json(updated);
    });

    router.delete("/ingredients/:id", async (req, res) => {
        const removed = await repos.ingredients.remove(
            uuidParam(req.params.id),
        );
        if (!removed) throw notFound("Ingredient");
        await deleteImage(removed.image);
        res.json(removed);
    });

    /* ---------- pizzas ---------- */

    router.post("/pizzas", uploadImage, async (req, res) => {
        const input = parse(pizzaInputSchema, req.body);
        await assertIngredientsExist(repos, input.ingredientIds);
        const image = req.file && (await saveImage(req.file));
        res.status(201).json(await repos.pizzas.create({ ...input, image }));
    });

    router.put("/pizzas/:id", uploadImage, async (req, res) => {
        const id = uuidParam(req.params.id);
        const input = parse(pizzaInputSchema, req.body);
        await assertIngredientsExist(repos, input.ingredientIds);
        const previous = await repos.pizzas.findById(id);
        if (!previous) throw notFound("Pizza");
        const image = req.file && (await saveImage(req.file));
        const updated = await repos.pizzas.update(id, { ...input, image });
        if (image) await deleteImage(previous.image);
        res.json(updated);
    });

    router.delete("/pizzas/:id", async (req, res) => {
        const removed = await repos.pizzas.remove(uuidParam(req.params.id));
        if (!removed) throw notFound("Pizza");
        await deleteImage(removed.image);
        res.json(removed);
    });

    /* ---------- products ---------- */

    router.post("/products", uploadImage, async (req, res) => {
        const input = parse(productInputSchema, req.body);
        const image = req.file && (await saveImage(req.file));
        res.status(201).json(await repos.products.create({ ...input, image }));
    });

    router.put("/products/:id", uploadImage, async (req, res) => {
        const id = uuidParam(req.params.id);
        const input = parse(productInputSchema, req.body);
        const previous = await repos.products.findById(id);
        if (!previous) throw notFound("Product");
        const image = req.file && (await saveImage(req.file));
        const updated = await repos.products.update(id, { ...input, image });
        if (image) await deleteImage(previous.image);
        res.json(updated);
    });

    router.delete("/products/:id", async (req, res) => {
        const removed = await repos.products.remove(uuidParam(req.params.id));
        if (!removed) throw notFound("Product");
        await deleteImage(removed.image);
        res.json(removed);
    });

    /* ---------- reports ---------- */

    // GET /admin/reports?from=2026-01-01&to=2026-01-31
    router.get("/reports", async (req, res) => {
        const query = parse(reportQuerySchema, req.query);
        const to = query.to ?? new Date();
        const from = query.from ?? new Date(to.getTime() - 30 * DAY_MS);
        res.json(await generateReport(repos, from, to));
    });

    return router;
};

const assertIngredientsExist = async (repos: Repositories, ids: string[]) => {
    const found = await repos.ingredients.findByIds(ids);
    if (found.length !== new Set(ids).size) {
        throw new HttpError(400, "One or more ingredients do not exist");
    }
};
