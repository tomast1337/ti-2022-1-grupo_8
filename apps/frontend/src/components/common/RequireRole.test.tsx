import type { Role } from "@pizzaria/dtos";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { makeStore } from "../../app/store";
import { signedIn } from "../../features/session/sessionSlice";
import { RequireRole } from "./RequireRole";

const renderAt = (sessionRole: Role | null, required: Role) => {
    const store = makeStore();
    if (sessionRole) {
        store.dispatch(
            signedIn({
                token: "t",
                user: {
                    id: "5f0c2b7e-6a0b-4f0e-9a52-0d3c1c1f6b11",
                    name: "Test",
                    email: "test@example.com",
                    role: sessionRole,
                },
            }),
        );
    }
    render(
        <Provider store={store}>
            <MemoryRouter initialEntries={["/secret"]}>
                <Routes>
                    <Route element={<RequireRole role={required} />}>
                        <Route path="/secret" element={<p>secret</p>} />
                    </Route>
                    <Route path="/login" element={<p>login page</p>} />
                    <Route path="/admin" element={<p>admin home</p>} />
                    <Route
                        path="/customer/menu"
                        element={<p>customer home</p>}
                    />
                </Routes>
            </MemoryRouter>
        </Provider>,
    );
};

describe("RequireRole", () => {
    it("redirects to /login without a session", () => {
        renderAt(null, "employee");
        expect(screen.getByText("login page")).toBeTruthy();
    });

    it("redirects to the user's home on a role mismatch", () => {
        renderAt("customer", "admin");
        expect(screen.getByText("customer home")).toBeTruthy();
    });

    it("renders the outlet for the right role", () => {
        renderAt("admin", "admin");
        expect(screen.getByText("secret")).toBeTruthy();
    });
});
