import type { Db } from "../db/index.js";

export const refreshTokensRepository = (db: Db) => ({
    async create(input: {
        userId: string;
        familyId: string;
        tokenHash: string;
        expiresAt: Date;
    }) {
        await db
            .insertInto("refresh_tokens")
            .values({
                user_id: input.userId,
                family_id: input.familyId,
                token_hash: input.tokenHash,
                expires_at: input.expiresAt,
            })
            .execute();
    },

    async findByHash(tokenHash: string) {
        const row = await db
            .selectFrom("refresh_tokens")
            .selectAll()
            .where("token_hash", "=", tokenHash)
            .executeTakeFirst();
        return (
            row && {
                id: row.id,
                userId: row.user_id,
                familyId: row.family_id,
                expiresAt: new Date(row.expires_at),
                usedAt: row.used_at ? new Date(row.used_at) : null,
            }
        );
    },

    /** True only for the first caller, so a token is exchanged at most once. */
    async markUsed(id: string): Promise<boolean> {
        const row = await db
            .updateTable("refresh_tokens")
            .set({ used_at: new Date() })
            .where("id", "=", id)
            .where("used_at", "is", null)
            .returning("id")
            .executeTakeFirst();
        return row !== undefined;
    },

    /** Ends the whole login: every token handed out since it started. */
    async revokeFamily(familyId: string) {
        await db
            .deleteFrom("refresh_tokens")
            .where("family_id", "=", familyId)
            .execute();
    },

    async deleteExpired() {
        await db
            .deleteFrom("refresh_tokens")
            .where("expires_at", "<", new Date())
            .execute();
    },
});
