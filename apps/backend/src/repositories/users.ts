import type { Role, User } from "@pizzaria/dtos";
import type { Db } from "../db/index.js";
import type { UsersTable } from "../db/types.js";
import type { Selectable } from "kysely";

type UserRow = Selectable<UsersTable>;

const toUser = (row: UserRow): User => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
});

export const usersRepository = (db: Db) => ({
    async list(): Promise<User[]> {
        const rows = await db
            .selectFrom("users")
            .selectAll()
            .orderBy("name")
            .execute();
        return rows.map(toUser);
    },

    async findById(id: string): Promise<User | undefined> {
        const row = await db
            .selectFrom("users")
            .selectAll()
            .where("id", "=", id)
            .executeTakeFirst();
        return row && toUser(row);
    },

    /** Includes the password hash; only for authentication. */
    async findCredentialsByEmail(email: string) {
        const row = await db
            .selectFrom("users")
            .selectAll()
            .where("email", "=", email)
            .executeTakeFirst();
        return row && { user: toUser(row), passwordHash: row.password_hash };
    },

    async create(input: {
        name: string;
        email: string;
        passwordHash: string;
        role?: Role;
    }): Promise<User> {
        const row = await db
            .insertInto("users")
            .values({
                name: input.name,
                email: input.email,
                password_hash: input.passwordHash,
                role: input.role ?? "customer",
            })
            .returningAll()
            .executeTakeFirstOrThrow();
        return toUser(row);
    },

    async updateRole(id: string, role: Role): Promise<User | undefined> {
        const row = await db
            .updateTable("users")
            .set({ role })
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirst();
        return row && toUser(row);
    },

    async remove(id: string): Promise<User | undefined> {
        const row = await db
            .deleteFrom("users")
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirst();
        return row && toUser(row);
    },
});
