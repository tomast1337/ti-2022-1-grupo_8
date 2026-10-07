import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema
        .createTable("users")
        .addColumn("id", "uuid", (c) =>
            c.primaryKey().defaultTo(sql`gen_random_uuid()`),
        )
        .addColumn("name", "text", (c) => c.notNull())
        .addColumn("email", "text", (c) => c.notNull().unique())
        .addColumn("password_hash", "text", (c) => c.notNull())
        .addColumn("role", "text", (c) =>
            c
                .notNull()
                .defaultTo("customer")
                .check(sql`role in ('customer', 'admin', 'employee')`),
        )
        .addColumn("created_at", "timestamptz", (c) =>
            c.notNull().defaultTo(sql`now()`),
        )
        .execute();

    await db.schema
        .createTable("ingredients")
        .addColumn("id", "uuid", (c) =>
            c.primaryKey().defaultTo(sql`gen_random_uuid()`),
        )
        .addColumn("name", "text", (c) => c.notNull().unique())
        .addColumn("description", "text", (c) => c.notNull())
        .addColumn("price", sql`numeric(10,2)`, (c) =>
            c.notNull().check(sql`price >= 0`),
        )
        .addColumn("portion_weight", "integer", (c) =>
            c.notNull().check(sql`portion_weight > 0`),
        )
        .addColumn("image", "text", (c) => c.notNull().defaultTo(""))
        .execute();

    await db.schema
        .createTable("pizzas")
        .addColumn("id", "uuid", (c) =>
            c.primaryKey().defaultTo(sql`gen_random_uuid()`),
        )
        .addColumn("name", "text", (c) => c.notNull().unique())
        .addColumn("description", "text", (c) => c.notNull())
        .addColumn("image", "text", (c) => c.notNull().defaultTo(""))
        .execute();

    await db.schema
        .createTable("pizza_ingredients")
        .addColumn("pizza_id", "uuid", (c) =>
            c.notNull().references("pizzas.id").onDelete("cascade"),
        )
        .addColumn("ingredient_id", "uuid", (c) =>
            c.notNull().references("ingredients.id").onDelete("cascade"),
        )
        .addPrimaryKeyConstraint("pizza_ingredients_pk", [
            "pizza_id",
            "ingredient_id",
        ])
        .execute();

    await db.schema
        .createTable("products")
        .addColumn("id", "uuid", (c) =>
            c.primaryKey().defaultTo(sql`gen_random_uuid()`),
        )
        .addColumn("name", "text", (c) => c.notNull().unique())
        .addColumn("description", "text", (c) => c.notNull())
        .addColumn("price", sql`numeric(10,2)`, (c) =>
            c.notNull().check(sql`price >= 0`),
        )
        .addColumn("image", "text", (c) => c.notNull().defaultTo(""))
        .execute();

    await db.schema
        .createTable("orders")
        .addColumn("id", "uuid", (c) =>
            c.primaryKey().defaultTo(sql`gen_random_uuid()`),
        )
        .addColumn("user_id", "uuid", (c) =>
            c.references("users.id").onDelete("set null"),
        )
        .addColumn("user_email", "text", (c) => c.notNull())
        .addColumn("address", "text", (c) => c.notNull())
        .addColumn("items", "jsonb", (c) => c.notNull())
        .addColumn("status", "text", (c) =>
            c
                .notNull()
                .defaultTo("placed")
                .check(sql`status in ('placed', 'in_progress', 'completed')`),
        )
        .addColumn("created_at", "timestamptz", (c) =>
            c.notNull().defaultTo(sql`now()`),
        )
        .execute();

    await db.schema
        .createIndex("orders_user_email_idx")
        .on("orders")
        .column("user_email")
        .execute();
    await db.schema
        .createIndex("orders_status_created_idx")
        .on("orders")
        .columns(["status", "created_at"])
        .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
    for (const table of [
        "orders",
        "products",
        "pizza_ingredients",
        "pizzas",
        "ingredients",
        "users",
    ]) {
        await db.schema.dropTable(table).ifExists().execute();
    }
}
