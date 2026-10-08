import type { Ingredient, Translations } from "@pizzaria/dtos";
import type { Selectable } from "kysely";
import { cleanTranslations } from "../lib/localize.js";
import type { Db } from "../db/index.js";
import type { IngredientsTable } from "../db/types.js";

const toIngredient = (row: Selectable<IngredientsTable>): Ingredient => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    portionWeight: row.portion_weight,
    image: row.image,
    translations: row.translations,
});

interface IngredientFields {
    name: string;
    description: string;
    price: number;
    portionWeight: number;
    image?: string;
    translations: Translations;
}

export const ingredientsRepository = (db: Db) => ({
    async list(): Promise<Ingredient[]> {
        const rows = await db
            .selectFrom("ingredients")
            .selectAll()
            .orderBy("name")
            .execute();
        return rows.map(toIngredient);
    },

    async findById(id: string): Promise<Ingredient | undefined> {
        const row = await db
            .selectFrom("ingredients")
            .selectAll()
            .where("id", "=", id)
            .executeTakeFirst();
        return row && toIngredient(row);
    },

    async findByIds(ids: string[]): Promise<Ingredient[]> {
        if (ids.length === 0) return [];
        const rows = await db
            .selectFrom("ingredients")
            .selectAll()
            .where("id", "in", ids)
            .execute();
        return rows.map(toIngredient);
    },

    async create(input: IngredientFields): Promise<Ingredient> {
        const row = await db
            .insertInto("ingredients")
            .values({
                name: input.name,
                description: input.description,
                price: input.price,
                portion_weight: input.portionWeight,
                image: input.image ?? "",
                translations: cleanTranslations(input.translations),
            })
            .returningAll()
            .executeTakeFirstOrThrow();
        return toIngredient(row);
    },

    async update(
        id: string,
        input: IngredientFields,
    ): Promise<Ingredient | undefined> {
        const row = await db
            .updateTable("ingredients")
            .set({
                name: input.name,
                description: input.description,
                price: input.price,
                portion_weight: input.portionWeight,
                translations: cleanTranslations(input.translations),
                // keep the current image when none was uploaded
                ...(input.image !== undefined && { image: input.image }),
            })
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirst();
        return row && toIngredient(row);
    },

    async remove(id: string): Promise<Ingredient | undefined> {
        const row = await db
            .deleteFrom("ingredients")
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirst();
        return row && toIngredient(row);
    },
});
