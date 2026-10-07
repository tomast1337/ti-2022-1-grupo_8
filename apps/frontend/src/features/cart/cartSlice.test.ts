import type { CartItem } from "@pizzaria/dtos";
import { describe, expect, it } from "vitest";
import reducer, {
    addressChanged,
    cartCleared,
    itemAdded,
    itemRemoved,
    quantityChanged,
    selectCartTotal,
    type CartState,
} from "./cartSlice";

const pizza = (id: string, price: number, quantity = 1): CartItem => ({
    type: "pizza",
    id,
    name: `Pizza ${id}`,
    price,
    quantity,
});

const empty: CartState = { items: [], address: "" };

describe("cartSlice", () => {
    it("adds items and ignores duplicates by id", () => {
        let state = reducer(empty, itemAdded(pizza("a", 10)));
        state = reducer(state, itemAdded(pizza("a", 99, 5)));
        state = reducer(state, itemAdded(pizza("b", 20)));
        expect(state.items.map((i) => i.id)).toEqual(["a", "b"]);
        expect(state.items[0]?.price).toBe(10);
    });

    it("removes an item", () => {
        const state = reducer(
            { ...empty, items: [pizza("a", 10), pizza("b", 20)] },
            itemRemoved("a"),
        );
        expect(state.items.map((i) => i.id)).toEqual(["b"]);
    });

    it("changes quantity but rejects non-positive values", () => {
        let state = reducer(
            { ...empty, items: [pizza("a", 10)] },
            quantityChanged({ id: "a", quantity: 3 }),
        );
        expect(state.items[0]?.quantity).toBe(3);
        state = reducer(state, quantityChanged({ id: "a", quantity: 0 }));
        expect(state.items[0]?.quantity).toBe(3);
    });

    it("computes the total", () => {
        const state = reducer(
            { ...empty, items: [pizza("a", 10, 2), pizza("b", 5, 3)] },
            addressChanged("Rua A"),
        );
        expect(selectCartTotal({ cart: state })).toBe(35);
    });

    it("clears items and address", () => {
        const state = reducer(
            { items: [pizza("a", 10)], address: "Rua A" },
            cartCleared(),
        );
        expect(state).toEqual(empty);
    });
});
