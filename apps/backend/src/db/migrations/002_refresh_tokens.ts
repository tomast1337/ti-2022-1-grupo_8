import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema
        .createTable("refresh_tokens")
        .addColumn("id", "uuid", (c) =>
            c.primaryKey().defaultTo(sql`gen_random_uuid()`),
        )
        .addColumn("user_id", "uuid", (c) =>
            c.notNull().references("users.id").onDelete("cascade"),
        )
        // every login starts a family; rotation keeps it, reuse revokes it
        .addColumn("family_id", "uuid", (c) => c.notNull())
        // only the SHA-256 of the token is stored, like a password hash
        .addColumn("token_hash", "text", (c) => c.notNull().unique())
        .addColumn("expires_at", "timestamptz", (c) => c.notNull())
        .addColumn("used_at", "timestamptz")
        .addColumn("created_at", "timestamptz", (c) =>
            c.notNull().defaultTo(sql`now()`),
        )
        .execute();
    await db.schema
        .createIndex("refresh_tokens_family_idx")
        .on("refresh_tokens")
        .column("family_id")
        .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await db.schema.dropTable("refresh_tokens").ifExists().execute();
}
