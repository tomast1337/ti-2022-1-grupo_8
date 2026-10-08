import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { saveCart } from "../features/cart/cartSlice";
import pizzaBuilderReducer from "../features/pizzaBuilder/pizzaBuilderSlice";
import sessionReducer from "../features/session/sessionSlice";
import { api } from "../services/api";

export const makeStore = () =>
    configureStore({
        reducer: {
            [api.reducerPath]: api.reducer,
            session: sessionReducer,
            cart: cartReducer,
            pizzaBuilder: pizzaBuilderReducer,
        },
        middleware: (getDefault) => getDefault().concat(api.middleware),
    });

export const store = makeStore();

// persist the cart; signing out also drops cached server data
let previousToken = store.getState().session.token;
store.subscribe(() => {
    const { session, cart } = store.getState();
    saveCart(cart);

    const signedOut = previousToken !== null && session.token === null;
    // update before dispatching: resetApiState re-enters this subscriber
    previousToken = session.token;
    if (signedOut) store.dispatch(api.util.resetApiState());
});

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
