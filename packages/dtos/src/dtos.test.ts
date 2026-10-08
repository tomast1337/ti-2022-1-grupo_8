import { describe, expect, it } from "vitest";
import {
    cartItemSchema,
    loginInputSchema,
    pizzaInputSchema,
    placeOrderInputSchema,
    registerInputSchema,
} from "./index.js";

const uuid = "5f0c2b7e-6a0b-4f0e-9a52-0d3c1c1f6b11";

describe("pizzaInputSchema", () => {
    it("parses comma separated ingredient ids from multipart forms", () => {
        const parsed = pizzaInputSchema.parse({
            name: "Margherita",
            description: "Classic",
            ingredientIds: `${uuid}, ${uuid}`,
        });
        expect(parsed.ingredientIds).toEqual([uuid, uuid]);
    });
});

describe("cartItemSchema", () => {
    it("accepts a custom pizza with halves", () => {
        const item = cartItemSchema.parse({
            type: "custom_pizza",
            id: "x",
            name: "Half and half",
            price: 30,
            quantity: 1,
            size: "large",
            halves: [[uuid], [uuid]],
            description: "Custom",
        });
        expect(item.type).toBe("custom_pizza");
    });

    it("rejects unknown item types", () => {
        expect(() =>
            cartItemSchema.parse({
                type: "burger",
                id: "x",
                name: "x",
                price: 1,
                quantity: 1,
            }),
        ).toThrow();
    });
});

describe("placeOrderInputSchema", () => {
    it("rejects empty carts", () => {
        expect(() =>
            placeOrderInputSchema.parse({ address: "Rua A", items: [] }),
        ).toThrow();
    });
});

describe("auth schemas", () => {
    it("normalizes emails so case and spaces do not create new accounts", () => {
        const parsed = loginInputSchema.parse({
            email: "  Ana@Example.COM ",
            password: "x",
        });
        expect(parsed.email).toBe("ana@example.com");
    });

    it("rejects passwords outside 8..72 characters on register", () => {
        const base = { name: "Ana", email: "ana@example.com" };
        expect(
            registerInputSchema.safeParse({ ...base, password: "1234567" })
                .success,
        ).toBe(false);
        expect(
            registerInputSchema.safeParse({ ...base, password: "a".repeat(73) })
                .success,
        ).toBe(false);
        expect(
            registerInputSchema.safeParse({ ...base, password: "12345678" })
                .success,
        ).toBe(true);
    });
});
