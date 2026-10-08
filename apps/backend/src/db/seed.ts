import bcrypt from "bcrypt";
import { createDb } from "./index.js";
import { migrateToLatest } from "./migrate.js";
import seedData from "./seed-data.json" with { type: "json" };

const force = process.argv.includes("--force");
// dev-only credentials; override with SEED_PASSWORD
const password = process.env.SEED_PASSWORD ?? "pizzaria123";

const db = createDb();

try {
    await migrateToLatest(db);

    const existing = await db
        .selectFrom("users")
        .select("id")
        .limit(1)
        .executeTakeFirst();
    if (existing && !force) {
        console.log(
            "Database already has data, skipping seed (use --force to reset).",
        );
    } else {
        await db.transaction().execute(async (trx) => {
            if (force) {
                // pizza_ingredients and orders go with their parents
                for (const table of [
                    "refresh_tokens",
                    "orders",
                    "pizzas",
                    "ingredients",
                    "products",
                    "users",
                ] as const) {
                    await trx.deleteFrom(table).execute();
                }
            }

            const passwordHash = await bcrypt.hash(password, 10);
            await trx
                .insertInto("users")
                .values([
                    {
                        name: "Administrator",
                        email: "admin@pizzaria.local",
                        password_hash: passwordHash,
                        role: "admin",
                    },
                    {
                        name: "Employee",
                        email: "employee@pizzaria.local",
                        password_hash: passwordHash,
                        role: "employee",
                    },
                    {
                        name: "Customer",
                        email: "customer@pizzaria.local",
                        password_hash: passwordHash,
                        role: "customer",
                    },
                ])
                .execute();

            const ingredients = await trx
                .insertInto("ingredients")
                .values(
                    seedData.ingredients.map((i) => ({
                        name: i.name,
                        description: i.description,
                        price: i.price,
                        portion_weight: i.portionWeight,
                        image: i.image,
                        translations: i.translations,
                    })),
                )
                .returning(["id", "name"])
                .execute();
            const ingredientId = new Map(
                ingredients.map((i) => [i.name, i.id]),
            );

            for (const pizza of seedData.pizzas) {
                const row = await trx
                    .insertInto("pizzas")
                    .values({
                        name: pizza.name,
                        description: pizza.description,
                        image: pizza.image,
                        translations: pizza.translations,
                    })
                    .returning("id")
                    .executeTakeFirstOrThrow();
                await trx
                    .insertInto("pizza_ingredients")
                    .values(
                        pizza.ingredients.map((name) => ({
                            pizza_id: row.id,
                            ingredient_id: ingredientId.get(name)!,
                        })),
                    )
                    .execute();
            }

            await trx
                .insertInto("products")
                .values(seedData.products)
                .execute();
        });
        console.log(
            `Seeded. Users: admin@/employee@/customer@pizzaria.local, password "${password}".`,
        );
    }
} catch (error) {
    console.error(error);
    process.exitCode = 1;
} finally {
    await db.destroy();
}
