import type { Report, ReportRow } from "@pizzaria/dtos";
import { roundMoney } from "../lib/pricing.js";
import type { Repositories } from "../repositories/index.js";

type Accumulator = Map<string, ReportRow>;

const add = (
    acc: Accumulator,
    id: string,
    name: string,
    quantity: number,
    revenue: number,
) => {
    const row = acc.get(id) ?? { id, name, quantity: 0, revenue: 0 };
    row.quantity += quantity;
    row.revenue = roundMoney(row.revenue + revenue);
    acc.set(id, row);
};

const ranked = (acc: Accumulator): ReportRow[] =>
    [...acc.values()].sort((a, b) => b.quantity - a.quantity);

/** Sales per ingredient (custom pizzas), pizza and product between two dates. */
export const generateReport = async (
    repos: Repositories,
    from: Date,
    to: Date,
): Promise<Report> => {
    const [orders, ingredients] = await Promise.all([
        repos.orders.listBetween(from, to),
        repos.ingredients.list(),
    ]);

    const ingredientRows: Accumulator = new Map();
    const pizzaRows: Accumulator = new Map();
    const productRows: Accumulator = new Map();

    for (const order of orders) {
        for (const item of order.items) {
            if (item.type === "pizza") {
                add(
                    pizzaRows,
                    item.id,
                    item.name,
                    item.quantity,
                    item.price * item.quantity,
                );
            } else if (item.type === "product") {
                add(
                    productRows,
                    item.id,
                    item.name,
                    item.quantity,
                    item.price * item.quantity,
                );
            } else {
                for (const id of item.halves.flat()) {
                    const ingredient = ingredients.find((i) => i.id === id);
                    if (!ingredient) continue; // deleted since the order
                    add(
                        ingredientRows,
                        id,
                        ingredient.name,
                        item.quantity,
                        ingredient.price * item.quantity,
                    );
                }
            }
        }
    }

    return {
        ingredients: ranked(ingredientRows),
        pizzas: ranked(pizzaRows),
        products: ranked(productRows),
    };
};
