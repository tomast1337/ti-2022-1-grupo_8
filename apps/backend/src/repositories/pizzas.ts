import type { Pizza, Translations } from "@pizzaria/dtos";
import type { Db } from "../db/index.js";
import { cleanTranslations } from "../lib/localize.js";
import { menuPizzaPrice } from "../lib/pricing.js";

interface PizzaFields {
    name: string;
    description: string;
    ingredientIds: string[];
    image?: string;
    translations: Translations;
}

export const pizzasRepository = (db: Db) => {
    /** Loads pizzas with their ingredient ids and computed price. */
    const load = async (id?: string): Promise<Pizza[]> => {
        let pizzaQuery = db.selectFrom("pizzas").selectAll();
        if (id) pizzaQuery = pizzaQuery.where("id", "=", id);
        const pizzas = await pizzaQuery.execute();
        if (pizzas.length === 0) return [];

        const links = await db
            .selectFrom("pizza_ingredients")
            .innerJoin(
                "ingredients",
                "ingredients.id",
                "pizza_ingredients.ingredient_id",
            )
            .select([
                "pizza_ingredients.pizza_id",
                "ingredients.id as ingredient_id",
                "ingredients.price",
            ])
            .where(
                "pizza_ingredients.pizza_id",
                "in",
                pizzas.map((p) => p.id),
            )
            .execute();

        return pizzas
            .map((pizza) => {
                const mine = links.filter((link) => link.pizza_id === pizza.id);
                return {
                    id: pizza.id,
                    name: pizza.name,
                    description: pizza.description,
                    image: pizza.image,
                    translations: pizza.translations,
                    ingredientIds: mine.map((link) => link.ingredient_id),
                    price: menuPizzaPrice(mine.map((link) => link.price)),
                };
            })
            .sort((a, b) => a.price - b.price);
    };

    return {
        list: () => load(),

        async findById(id: string): Promise<Pizza | undefined> {
            return (await load(id))[0];
        },

        async findByIds(ids: string[]): Promise<Pizza[]> {
            if (ids.length === 0) return [];
            const all = await load();
            return all.filter((pizza) => ids.includes(pizza.id));
        },

        async create(input: PizzaFields): Promise<Pizza> {
            const id = await db.transaction().execute(async (trx) => {
                const row = await trx
                    .insertInto("pizzas")
                    .values({
                        name: input.name,
                        description: input.description,
                        image: input.image ?? "",
                        translations: cleanTranslations(input.translations),
                    })
                    .returning("id")
                    .executeTakeFirstOrThrow();
                await trx
                    .insertInto("pizza_ingredients")
                    .values(
                        input.ingredientIds.map((ingredient_id) => ({
                            pizza_id: row.id,
                            ingredient_id,
                        })),
                    )
                    .execute();
                return row.id;
            });
            return (await load(id))[0]!;
        },

        async update(
            id: string,
            input: PizzaFields,
        ): Promise<Pizza | undefined> {
            const found = await db.transaction().execute(async (trx) => {
                const updated = await trx
                    .updateTable("pizzas")
                    .set({
                        name: input.name,
                        description: input.description,
                        translations: cleanTranslations(input.translations),
                        ...(input.image !== undefined && {
                            image: input.image,
                        }),
                    })
                    .where("id", "=", id)
                    .returning("id")
                    .executeTakeFirst();
                if (!updated) return false;
                await trx
                    .deleteFrom("pizza_ingredients")
                    .where("pizza_id", "=", id)
                    .execute();
                await trx
                    .insertInto("pizza_ingredients")
                    .values(
                        input.ingredientIds.map((ingredient_id) => ({
                            pizza_id: id,
                            ingredient_id,
                        })),
                    )
                    .execute();
                return true;
            });
            return found ? (await load(id))[0] : undefined;
        },

        async remove(id: string): Promise<Pizza | undefined> {
            const pizza = (await load(id))[0];
            if (!pizza) return undefined;
            await db.deleteFrom("pizzas").where("id", "=", id).execute();
            return pizza;
        },
    };
};
