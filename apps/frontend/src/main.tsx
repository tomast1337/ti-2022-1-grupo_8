import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./app/store";
import { restoreSession } from "./features/session/sessionThunks";
import "./styles/tailwind.css";

// a returning visitor's session comes back from the refresh cookie before the first render
await store.dispatch(restoreSession());

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </StrictMode>,
);
