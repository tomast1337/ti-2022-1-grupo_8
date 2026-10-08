import type { Translations } from "@pizzaria/dtos";
import type { ColumnType, Generated, JSONColumnType } from "kysely";
import type { CartItem, OrderStatus, Role } from "@pizzaria/dtos";

/** Defaults to now() on insert. */
type Timestamp = ColumnType<Date, Date | string | undefined, Date | string>;

export interface UsersTable {
    id: Generated<string>;
    name: string;
    email: string;
    password_hash: string;
    role: Role;
    created_at: Timestamp;
}

export interface IngredientsTable {
    id: Generated<string>;
    name: string;
    description: string;
    price: number;
    portion_weight: number;
    image: string;
    translations: Translations;
}

export interface PizzasTable {
    id: Generated<string>;
    name: string;
    description: string;
    image: string;
    translations: Translations;
}

export interface PizzaIngredientsTable {
    pizza_id: string;
    ingredient_id: string;
}

export interface ProductsTable {
    id: Generated<string>;
    name: string;
    description: string;
    price: number;
    image: string;
    translations: Translations;
}

export interface OrdersTable {
    id: Generated<string>;
    /** Null once the user account is deleted; `user_email` keeps the history. */
    user_id: string | null;
    user_email: string;
    address: string;
    items: JSONColumnType<CartItem[]>;
    status: Generated<OrderStatus>;
    created_at: Timestamp;
}

export interface RefreshTokensTable {
    id: Generated<string>;
    user_id: string;
    family_id: string;
    token_hash: string;
    expires_at: Timestamp;
    /** Set when the token was exchanged for a new one. */
    used_at: ColumnType<
        Date | null,
        Date | string | null | undefined,
        Date | string | null
    >;
    created_at: Timestamp;
}

export interface Database {
    users: UsersTable;
    ingredients: IngredientsTable;
    pizzas: PizzasTable;
    pizza_ingredients: PizzaIngredientsTable;
    products: ProductsTable;
    orders: OrdersTable;
    refresh_tokens: RefreshTokensTable;
}
