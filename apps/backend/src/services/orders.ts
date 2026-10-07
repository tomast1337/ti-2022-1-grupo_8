import type {
    CartItem,
    Order,
    OrderStatus,
    PlaceOrderInput,
} from "@pizzaria/dtos";
import { HttpError } from "../lib/errors.js";
import { customPizzaPrice } from "../lib/pricing.js";
import type { Repositories } from "../repositories/index.js";

/**
 * Rebuilds the cart from the database so clients cannot choose their own
 * prices or names for menu items.
 */
export const priceCart = async (
    repos: Repositories,
    items: CartItem[],
): Promise<CartItem[]> => {
    const pizzaIds = items.flatMap((item) =>
        item.type === "pizza" ? [item.id] : [],
    );
    const productIds = items.flatMap((item) =>
        item.type === "product" ? [item.id] : [],
    );
    const ingredientIds = items.flatMap((item) =>
        item.type === "custom_pizza" ? item.halves.flat() : [],
    );

    const [pizzas, products, ingredients] = await Promise.all([
        repos.pizzas.findByIds(pizzaIds),
        repos.products.findByIds(productIds),
        repos.ingredients.findByIds([...new Set(ingredientIds)]),
    ]);

    return items.map((item): CartItem => {
        switch (item.type) {
            case "pizza": {
                const pizza = pizzas.find((p) => p.id === item.id);
                if (!pizza)
                    throw new HttpError(400, `Unknown pizza ${item.id}`);
                return { ...item, name: pizza.name, price: pizza.price };
            }
            case "product": {
                const product = products.find((p) => p.id === item.id);
                if (!product)
                    throw new HttpError(400, `Unknown product ${item.id}`);
                return { ...item, name: product.name, price: product.price };
            }
            case "custom_pizza": {
                const prices = item.halves.flat().map((id) => {
                    const ingredient = ingredients.find((i) => i.id === id);
                    if (!ingredient)
                        throw new HttpError(400, `Unknown ingredient ${id}`);
                    return ingredient.price;
                });
                return { ...item, price: customPizzaPrice(item.size, prices) };
            }
        }
    });
};

export const placeOrder = async (
    repos: Repositories,
    user: { id: string; email: string },
    input: PlaceOrderInput,
): Promise<Order> =>
    repos.orders.create({
        userId: user.id,
        userEmail: user.email,
        address: input.address,
        items: await priceCart(repos, input.items),
    });

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
    placed: "in_progress",
    in_progress: "completed",
};

/** Employee action: placed -> in_progress -> completed. */
export const advanceOrder = async (
    repos: Repositories,
    id: string,
    expectedFrom: OrderStatus,
): Promise<Order> => {
    const to = NEXT_STATUS[expectedFrom];
    const order = await repos.orders.findById(id);
    if (!order) throw new HttpError(404, "Order not found");
    if (!to || order.status !== expectedFrom) {
        throw new HttpError(
            409,
            `Order is ${order.status}, expected ${expectedFrom}`,
        );
    }
    const updated = await repos.orders.transition(id, expectedFrom, to);
    if (!updated) throw new HttpError(409, "Order status changed meanwhile");
    return updated;
};
