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
}

export interface PizzasTable {
    id: Generated<string>;
    name: string;
    description: string;
    image: string;
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

export interface Database {
    users: UsersTable;
    ingredients: IngredientsTable;
    pizzas: PizzasTable;
    pizza_ingredients: PizzaIngredientsTable;
    products: ProductsTable;
    orders: OrdersTable;
}
