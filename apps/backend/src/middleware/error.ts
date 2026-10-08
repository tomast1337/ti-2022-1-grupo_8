import type { ErrorRequestHandler, RequestHandler } from "express";
import multer from "multer";
import { HttpError } from "../lib/errors.js";

export const notFoundHandler: RequestHandler = (_req, res) => {
    res.status(404).json({ error: "No pizzas 🍕 on this route 😠" });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof HttpError) {
        res.status(error.status).json({
            error: error.message,
            code: error.code,
            params: error.params,
        });
        return;
    }
    if (error instanceof multer.MulterError) {
        res.status(400).json({ error: error.message });
        return;
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
};
