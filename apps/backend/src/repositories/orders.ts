import type { CartItem, Order, OrderStatus } from "@pizzaria/dtos";
import type { Selectable } from "kysely";
import type { Db } from "../db/index.js";
import type { OrdersTable } from "../db/types.js";

const toOrder = (row: Selectable<OrdersTable>): Order => ({
    id: row.id,
    userEmail: row.user_email,
    createdAt: new Date(row.created_at).toISOString(),
    address: row.address,
    items: row.items,
    status: row.status,
});

export const ordersRepository = (db: Db) => ({
    /** Oldest first, optionally filtered by status (employee queue). */
    async list(status?: OrderStatus): Promise<Order[]> {
        let query = db
            .selectFrom("orders")
            .selectAll()
            .orderBy("created_at", "asc");
        if (status) query = query.where("status", "=", status);
        return (await query.execute()).map(toOrder);
    },

    /** Newest first. */
    async listByUserEmail(email: string): Promise<Order[]> {
        const rows = await db
            .selectFrom("orders")
            .selectAll()
            .where("user_email", "=", email)
            .orderBy("created_at", "desc")
            .execute();
        return rows.map(toOrder);
    },

    async listBetween(from: Date, to: Date): Promise<Order[]> {
        const rows = await db
            .selectFrom("orders")
            .selectAll()
            .where("created_at", ">=", from)
            .where("created_at", "<=", to)
            .execute();
        return rows.map(toOrder);
    },

    async findById(id: string): Promise<Order | undefined> {
        const row = await db
            .selectFrom("orders")
            .selectAll()
            .where("id", "=", id)
            .executeTakeFirst();
        return row && toOrder(row);
    },

    async create(input: {
        userId: string;
        userEmail: string;
        address: string;
        items: CartItem[];
    }): Promise<Order> {
        const row = await db
            .insertInto("orders")
            .values({
                user_id: input.userId,
                user_email: input.userEmail,
                address: input.address,
                // pg would serialize a JS array as a postgres array, so stringify for jsonb
                items: JSON.stringify(input.items),
            })
            .returningAll()
            .executeTakeFirstOrThrow();
        return toOrder(row);
    },

    /** Moves an order only if it is still in `from`, so concurrent clicks cannot skip a step. */
    async transition(
        id: string,
        from: OrderStatus,
        to: OrderStatus,
    ): Promise<Order | undefined> {
        const row = await db
            .updateTable("orders")
            .set({ status: to })
            .where("id", "=", id)
            .where("status", "=", from)
            .returningAll()
            .executeTakeFirst();
        return row && toOrder(row);
    },
});
