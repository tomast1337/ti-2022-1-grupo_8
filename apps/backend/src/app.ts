import cors from "cors";
import express from "express";
import { config } from "./config.js";
import type { Db } from "./db/index.js";
import { uploadsDir } from "./lib/storage.js";
import { authenticate, requireRole } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { createRepositories } from "./repositories/index.js";
import { adminRoutes } from "./routes/admin.js";
import { authRoutes } from "./routes/auth.js";
import { catalogRoutes } from "./routes/catalog.js";
import { customerRoutes } from "./routes/customer.js";
import { employeeRoutes } from "./routes/employee.js";

const publicDir = new URL("../public", import.meta.url).pathname;

export const createApp = (db: Db) => {
    const repos = createRepositories(db);
    const app = express();

    app.use(cors({ origin: config.CORS_ORIGIN.split(",") }));
    app.use(express.json());

    // static images: seed images shipped with the repo + admin uploads
    app.use(express.static(publicDir));
    app.use("/uploads", express.static(uploadsDir));

    app.get("/health", (_req, res) => res.json({ status: "ok" }));

    app.use("/auth", authRoutes(repos));
    app.use("/catalog", authenticate, catalogRoutes(repos));
    app.use(
        "/customer",
        authenticate,
        requireRole("customer"),
        customerRoutes(repos),
    );
    app.use(
        "/employee",
        authenticate,
        requireRole("employee"),
        employeeRoutes(repos),
    );
    app.use("/admin", authenticate, requireRole("admin"), adminRoutes(repos));

    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
};
