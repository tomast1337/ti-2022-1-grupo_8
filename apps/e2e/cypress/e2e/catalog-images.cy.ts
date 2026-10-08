import type { Ingredient, LoginResponse, Pizza, Product } from "@pizzaria/dtos";
import { accounts } from "../support/commands";

describe("catalog images", () => {
    before(() => cy.resetDb());

    it("serves a real image for every ingredient, pizza and product", () => {
        const apiUrl = Cypress.expose("apiUrl");
        cy.request<LoginResponse>("POST", `${apiUrl}/auth/login`, {
            email: accounts.customer,
            password: Cypress.expose("seedPassword"),
        })
            .its("body.token")
            .then((token) => {
                const headers = { authorization: `Bearer ${token}` };
                for (const kind of ["ingredients", "pizzas", "products"]) {
                    cy.request<(Ingredient | Pizza | Product)[]>({
                        url: `${apiUrl}/catalog/${kind}`,
                        headers,
                    }).then(({ body }) => {
                        expect(body.length, kind).to.be.greaterThan(0);
                        for (const item of body) {
                            expect(
                                item.image,
                                `${item.name} has an image`,
                            ).to.match(/^\/imgs\/.+\.webp$/);
                            cy.request({
                                url: `${apiUrl}${item.image}`,
                                encoding: "binary",
                            }).then((res) => {
                                expect(res.status, item.name).to.eq(200);
                                expect(
                                    res.headers["content-type"],
                                    item.name,
                                ).to.eq("image/webp");
                            });
                        }
                    });
                }
            });
    });
});
