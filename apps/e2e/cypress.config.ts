import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "cypress";

const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
);

export default defineConfig({
    e2e: {
        // Override with CYPRESS_BASE_URL / CYPRESS_apiUrl when ports differ (see README)
        baseUrl: process.env.CYPRESS_BASE_URL ?? "http://localhost:5173",
        expose: {
            apiUrl: process.env.CYPRESS_apiUrl ?? "http://localhost:3001",
            seedPassword: process.env.SEED_PASSWORD ?? "pizzaria123",
        },
        specPattern: "cypress/e2e/**/*.cy.ts",
        supportFile: "cypress/support/e2e.ts",
        video: false,
        // screenshots hang on some headless setups and hide the real assertion error
        screenshotOnRunFailure: false,
        viewportWidth: 1280,
        viewportHeight: 800,
        // specs share database state, so a retry would run against already-mutated data
        retries: 0,
        setupNodeEvents(on) {
            on("task", {
                /**
                 * Wipes and re-seeds the database used by the API under test.
                 * Needs DATABASE_URL (from the root .env or the environment) to point
                 * at the same Postgres the API uses, reachable from the host.
                 */
                "db:reset": () => {
                    const result = spawnSync(
                        "npm",
                        ["run", "db:reset", "-w", "@pizzaria/backend"],
                        { cwd: repoRoot, encoding: "utf8" },
                    );
                    if (result.status !== 0) {
                        throw new Error(
                            `db:reset failed:\n${result.stdout}\n${result.stderr}`,
                        );
                    }
                    return null;
                },
            });
        },
    },
});
