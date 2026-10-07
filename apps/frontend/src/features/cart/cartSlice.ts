import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "@pizzaria/dtos";

export interface CartState {
    items: CartItem[];
    address: string;
}

const STORAGE_KEY = "cart";

export const loadCart = (): CartState => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as CartState;
    } catch {
        // ignore corrupt or unavailable storage
    }
    return { items: [], address: "" };
};

export const saveCart = (cart: CartState) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
        // storage unavailable: cart lives in memory only
    }
};

const cartSlice = createSlice({
    name: "cart",
    initialState: loadCart,
    reducers: {
        /** Ignores items already in the cart (same id). */
        itemAdded: (state, { payload }: PayloadAction<CartItem>) => {
            if (!state.items.some((item) => item.id === payload.id)) {
                state.items.push(payload);
            }
        },
        itemRemoved: (state, { payload }: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.id !== payload);
        },
        quantityChanged: (
            state,
            { payload }: PayloadAction<{ id: string; quantity: number }>,
        ) => {
            const item = state.items.find((i) => i.id === payload.id);
            if (item && payload.quantity > 0) item.quantity = payload.quantity;
        },
        addressChanged: (state, { payload }: PayloadAction<string>) => {
            state.address = payload;
        },
        cartCleared: () => ({ items: [], address: "" }),
    },
});

export const {
    itemAdded,
    itemRemoved,
    quantityChanged,
    addressChanged,
    cartCleared,
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectAddress = (state: { cart: CartState }) => state.cart.address;
export const selectCartTotal = (state: { cart: CartState }) =>
    state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default cartSlice.reducer;
