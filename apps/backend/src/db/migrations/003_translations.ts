import { type Kysely, sql } from "kysely";

const TABLES = ["ingredients", "pizzas", "products"] as const;

/**
 * `name`/`description` become the default (English) text; `translations`
 * holds the other languages as {"pt-BR": {name, description}, ...}.
 * Existing rows were written in Portuguese, so that text is kept as the pt-BR
 * translation until an admin adds the English text.
 */
export async function up(db: Kysely<unknown>): Promise<void> {
    for (const table of TABLES) {
        await db.schema
            .alterTable(table)
            .addColumn("translations", "jsonb", (c) =>
                c.notNull().defaultTo(sql`'{}'::jsonb`),
            )
            .execute();
        await sql`update ${sql.table(table)} set translations = jsonb_build_object('pt-BR', jsonb_build_object('name', name, 'description', description))`.execute(
            db,
        );
    }
}

export async function down(db: Kysely<unknown>): Promise<void> {
    for (const table of TABLES) {
        await db.schema.alterTable(table).dropColumn("translations").execute();
    }
}
