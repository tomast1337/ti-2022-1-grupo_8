import { createApp } from "./app.js";
import { config } from "./config.js";
import { createDb } from "./db/index.js";
import { migrateToLatest } from "./db/migrate.js";
import { createRepositories } from "./repositories/index.js";

const db = createDb();
await migrateToLatest(db);

const server = createApp(db).listen(config.BACKEND_PORT, () => {
    console.log(`🍕 API listening on http://localhost:${config.BACKEND_PORT}`);
});

// expired refresh tokens are useless: sweep them at start and then hourly
const { refreshTokens } = createRepositories(db);
const sweep = () => void refreshTokens.deleteExpired().catch(console.error);
sweep();
const sweeper = setInterval(sweep, 60 * 60 * 1000);

const shutdown = () => {
    clearInterval(sweeper);
    server.close(() => db.destroy().finally(() => process.exit(0)));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
