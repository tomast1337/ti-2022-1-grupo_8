import type { LoginResponse, Role } from "@pizzaria/dtos";

/** Seeded accounts (see apps/backend/src/db/seed.ts). */
export const accounts: Record<Role, string> = {
    customer: "customer@pizzaria.local",
    employee: "employee@pizzaria.local",
    admin: "admin@pizzaria.local",
};

Cypress.Commands.add("resetDb", () => {
    cy.task("db:reset", null, { timeout: 120_000 });
});

/** Logs in through the API and opens `path` with the session already stored. */
Cypress.Commands.add("visitAs", (role: Role, path: string) => {
    cy.request<LoginResponse>(
        "POST",
        `${Cypress.expose("apiUrl")}/auth/login`,
        {
            email: accounts[role],
            password: Cypress.expose("seedPassword"),
        },
    ).then(({ body }) => {
        cy.visit(path, {
            onBeforeLoad(win) {
                win.localStorage.setItem(
                    "session",
                    JSON.stringify({ token: body.token, user: body.user }),
                );
            },
        });
    });
});

/** Logs in through the login form. */
Cypress.Commands.add("loginViaUi", (email: string, password: string) => {
    cy.visit("/login");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password, { log: false });
    cy.contains("button", "Logar").click();
});
