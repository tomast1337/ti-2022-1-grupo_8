import { describe, expect, it } from "vitest";
import { customPizzaPrice, menuPizzaPrice } from "./pricing.js";

describe("pricing", () => {
    it("menu pizza = base 20 + ingredients", () => {
        expect(menuPizzaPrice([0.78, 0.92])).toBe(21.7);
    });

    it("custom pizza = size price + every ingredient of every half", () => {
        expect(customPizzaPrice("large", [1, 2, 3])).toBe(26);
        expect(customPizzaPrice("small", [])).toBe(10);
    });

    it("avoids float drift", () => {
        expect(menuPizzaPrice([0.1, 0.2])).toBe(20.3);
    });
});
