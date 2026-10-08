import type { Db } from "../db/index.js";
import { ingredientsRepository } from "./ingredients.js";
import { ordersRepository } from "./orders.js";
import { pizzasRepository } from "./pizzas.js";
import { productsRepository } from "./products.js";
import { refreshTokensRepository } from "./refresh-tokens.js";
import { usersRepository } from "./users.js";

export const createRepositories = (db: Db) => ({
    users: usersRepository(db),
    ingredients: ingredientsRepository(db),
    pizzas: pizzasRepository(db),
    products: productsRepository(db),
    orders: ordersRepository(db),
    refreshTokens: refreshTokensRepository(db),
});

export type Repositories = ReturnType<typeof createRepositories>;
