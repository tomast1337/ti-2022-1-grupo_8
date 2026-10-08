import type { Product, Translations } from "@pizzaria/dtos";
import type { Selectable } from "kysely";
import { cleanTranslations } from "../lib/localize.js";
import type { Db } from "../db/index.js";
import type { ProductsTable } from "../db/types.js";

const toProduct = (row: Selectable<ProductsTable>): Product => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image,
    translations: row.translations,
});

interface ProductFields {
    name: string;
    description: string;
    price: number;
    image?: string;
    translations: Translations;
}

export const productsRepository = (db: Db) => ({
    async list(): Promise<Product[]> {
        const rows = await db
            .selectFrom("products")
            .selectAll()
            .orderBy("name")
            .execute();
        return rows.map(toProduct);
    },

    async findById(id: string): Promise<Product | undefined> {
        const row = await db
            .selectFrom("products")
            .selectAll()
            .where("id", "=", id)
            .executeTakeFirst();
        return row && toProduct(row);
    },

    async findByIds(ids: string[]): Promise<Product[]> {
        if (ids.length === 0) return [];
        const rows = await db
            .selectFrom("products")
            .selectAll()
            .where("id", "in", ids)
            .execute();
        return rows.map(toProduct);
    },

    async create(input: ProductFields): Promise<Product> {
        const row = await db
            .insertInto("products")
            .values({
                ...input,
                image: input.image ?? "",
                translations: cleanTranslations(input.translations),
            })
            .returningAll()
            .executeTakeFirstOrThrow();
        return toProduct(row);
    },

    async update(
        id: string,
        input: ProductFields,
    ): Promise<Product | undefined> {
        const { image, ...rest } = input;
        const row = await db
            .updateTable("products")
            .set({
                ...rest,
                translations: cleanTranslations(rest.translations),
                ...(image !== undefined && { image }),
            })
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirst();
        return row && toProduct(row);
    },

    async remove(id: string): Promise<Product | undefined> {
        const row = await db
            .deleteFrom("products")
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirst();
        return row && toProduct(row);
    },
});
