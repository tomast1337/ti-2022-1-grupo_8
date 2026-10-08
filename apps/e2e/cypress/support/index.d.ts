import type { Role } from "@pizzaria/dtos";

declare global {
    namespace Cypress {
        interface Chainable {
            /** Wipes and re-seeds the database. Call in `before`, not `beforeEach`. */
            resetDb(): Chainable<void>;
            /** API login + visit with the session in localStorage. */
            visitAs(role: Role, path: string): Chainable<void>;
            /**
             * Screenshot of the current viewport for the e2e report, taken once
             * the images on screen have loaded. Name it after what is on screen.
             */
            snap(name: string): Chainable<void>;
            /** Fills and submits the login form. */
            loginViaUi(email: string, password: string): Chainable<void>;
        }
    }
}
