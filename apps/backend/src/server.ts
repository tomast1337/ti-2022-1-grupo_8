import { createApp } from "./app.js";
import { config } from "./config.js";
import { createDb } from "./db/index.js";
import { migrateToLatest } from "./db/migrate.js";

const db = createDb();
await migrateToLatest(db);

const server = createApp(db).listen(config.BACKEND_PORT, () => {
    console.log(`🍕 API listening on http://localhost:${config.BACKEND_PORT}`);
});

const shutdown = () => {
    server.close(() => db.destroy().finally(() => process.exit(0)));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
