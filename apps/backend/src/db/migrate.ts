import { type Kysely, Migrator, type MigrationProvider } from "kysely";
import { createDb } from "./index.js";
import * as init from "./migrations/001_init.js";
import * as refreshTokens from "./migrations/002_refresh_tokens.js";

// Register new migrations here, keyed by a sortable name.
const provider: MigrationProvider = {
    getMigrations: async () => ({
        "001_init": init,
        "002_refresh_tokens": refreshTokens,
    }),
};

export const migrateToLatest = async (db: Kysely<any>) => {
    const { error, results } = await new Migrator({
        db,
        provider,
    }).migrateToLatest();
    for (const result of results ?? []) {
        console.log(`migration ${result.migrationName}: ${result.status}`);
    }
    if (error) throw error;
};

// run directly: `npm run db:migrate`
if (import.meta.url === `file://${process.argv[1]}`) {
    const db = createDb();
    migrateToLatest(db)
        .catch((error) => {
            console.error(error);
            process.exitCode = 1;
        })
        .finally(() => db.destroy());
}
