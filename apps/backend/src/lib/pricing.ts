import type { PizzaSize } from "@pizzaria/dtos";

export const MENU_PIZZA_BASE_PRICE = 20;

export const CUSTOM_PIZZA_SIZE_PRICE: Record<PizzaSize, number> = {
    small: 10,
    medium: 15,
    large: 20,
    family: 25,
};

export const roundMoney = (value: number): number =>
    Math.round(value * 100) / 100;

export const menuPizzaPrice = (ingredientPrices: number[]): number =>
    roundMoney(
        ingredientPrices.reduce(
            (sum, price) => sum + price,
            MENU_PIZZA_BASE_PRICE,
        ),
    );

export const customPizzaPrice = (
    size: PizzaSize,
    ingredientPrices: number[],
): number =>
    roundMoney(
        ingredientPrices.reduce(
            (sum, price) => sum + price,
            CUSTOM_PIZZA_SIZE_PRICE[size],
        ),
    );
