import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import type { Db } from "./db/index.js";
import { uploadsDir } from "./lib/storage.js";
import {
    authenticate as authenticateWith,
    requireRole,
} from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { authRateLimit } from "./middleware/rate-limit.js";
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

    // images are loaded from the frontend origin, so they must stay cross-origin
    app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
    app.use(cors({ origin: config.CORS_ORIGIN.split(",") }));
    app.use(express.json());

    // static images: seed images shipped with the repo + admin uploads
    app.use(express.static(publicDir));
    app.use("/uploads", express.static(uploadsDir));

    app.get("/health", (_req, res) => res.json({ status: "ok" }));

    app.use(
        "/auth",
        authRateLimit(
            config.AUTH_RATE_LIMIT_MAX,
            config.AUTH_RATE_LIMIT_WINDOW_MINUTES,
        ),
        authRoutes(repos),
    );
    const authenticate = authenticateWith(repos.users);
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
