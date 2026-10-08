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

/**
 * Logs in through the API and opens `path`. The login response sets the httpOnly
 * refresh cookie in the browser, and the app turns it into a session on load.
 */
Cypress.Commands.add("visitAs", (role: Role, path: string) => {
    cy.request<LoginResponse>(
        "POST",
        `${Cypress.expose("apiUrl")}/auth/login`,
        {
            email: accounts[role],
            password: Cypress.expose("seedPassword"),
        },
    );
    cy.visit(path);
});

/** Logs in through the login form. */
Cypress.Commands.add("loginViaUi", (email: string, password: string) => {
    cy.visit("/login");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password, { log: false });
    cy.contains("button", "Logar").click();
});

/**
 * Waits (up to 3s) for the images on screen, then saves a viewport screenshot
 * (see scripts/report.mjs). A slow image never fails the test.
 */
Cypress.Commands.add("snap", (name: string) => {
    cy.document({ log: false }).then(
        (doc) =>
            new Cypress.Promise<void>((resolve) => {
                const win = doc.defaultView as Window;
                const started = Date.now();
                const check = () => {
                    const pending = Array.from(
                        doc.querySelectorAll("img"),
                    ).filter((img) => {
                        const { top, bottom } = img.getBoundingClientRect();
                        return (
                            bottom > 0 && top < win.innerHeight && !img.complete
                        );
                    });
                    if (pending.length === 0 || Date.now() - started > 3000) {
                        resolve();
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            }),
    );
    cy.wait(250); // let transitions settle
    // the file name carries the test it belongs to; scripts/report.mjs groups by it
    const owner = Cypress.currentTest.titlePath
        .join(" ")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
    cy.screenshot(`${owner}__${name}`, {
        capture: "viewport",
        overwrite: true,
    });
});
