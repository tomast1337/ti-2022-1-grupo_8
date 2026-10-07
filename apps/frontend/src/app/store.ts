import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { saveCart } from "../features/cart/cartSlice";
import pizzaBuilderReducer from "../features/pizzaBuilder/pizzaBuilderSlice";
import sessionReducer, { saveSession } from "../features/session/sessionSlice";
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

// persist session and cart; signing out also drops cached server data
let previousToken = store.getState().session.token;
store.subscribe(() => {
    const { session, cart } = store.getState();
    saveSession(session);
    saveCart(cart);
    if (previousToken && !session.token)
        store.dispatch(api.util.resetApiState());
    previousToken = session.token;
});

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
