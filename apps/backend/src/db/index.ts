import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { config } from "../config.js";
import type { Database } from "./types.js";

// numeric(10,2) columns come back as strings by default
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) =>
    Number.parseFloat(value),
);

export const createDb = (connectionString = config.DATABASE_URL) =>
    new Kysely<Database>({
        dialect: new PostgresDialect({
            pool: new pg.Pool({ connectionString, max: 10 }),
        }),
    });

export type Db = Kysely<Database>;
