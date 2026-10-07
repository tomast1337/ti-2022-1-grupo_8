import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PizzaSize } from "@pizzaria/dtos";

export interface PizzaBuilderState {
    size: PizzaSize | null;
    /** One list of ingredient ids per half (1 to 4 halves). */
    halves: string[][];
}

const initialState: PizzaBuilderState = { size: null, halves: [[]] };

const pizzaBuilderSlice = createSlice({
    name: "pizzaBuilder",
    initialState,
    reducers: {
        sizeChosen: (state, { payload }: PayloadAction<PizzaSize>) => {
            state.size = payload;
        },
        halfCountChanged: (state, { payload }: PayloadAction<number>) => {
            const count = Math.min(4, Math.max(1, payload));
            state.halves = Array.from(
                { length: count },
                (_, i) => state.halves[i] ?? [],
            );
        },
        halfIngredientsChanged: (
            state,
            {
                payload,
            }: PayloadAction<{ index: number; ingredientIds: string[] }>,
        ) => {
            state.halves[payload.index] = payload.ingredientIds;
        },
        builderReset: () => initialState,
    },
});

export const {
    sizeChosen,
    halfCountChanged,
    halfIngredientsChanged,
    builderReset,
} = pizzaBuilderSlice.actions;

export const selectBuilder = (state: { pizzaBuilder: PizzaBuilderState }) =>
    state.pizzaBuilder;

export default pizzaBuilderSlice.reducer;
