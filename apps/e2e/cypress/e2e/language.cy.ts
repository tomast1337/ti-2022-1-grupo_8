describe("language", () => {
    before(() => cy.resetDb());

    it("starts in Portuguese and switches to English from the login page", () => {
        cy.visit("/login");
        cy.get("html").should("have.attr", "lang", "pt-BR");
        cy.contains("button", "Logar");
        cy.get("select").select("English");
        cy.get("html").should("have.attr", "lang", "en");
        cy.contains("button", "Sign in");
        cy.contains("Don't have an account? Sign up");
        cy.snap("login-english");
    });

    it("remembers the choice after a reload", () => {
        cy.visit("/login");
        cy.get("select").select("English");
        cy.reload();
        cy.contains("button", "Sign in");
        cy.get("select").should("have.value", "en");
    });

    it("follows the browser language when nothing was chosen", () => {
        cy.visit("/login", {
            onBeforeLoad(win) {
                win.localStorage.removeItem("lang");
                Object.defineProperty(win.navigator, "languages", {
                    value: ["en-US", "en"],
                });
                Object.defineProperty(win.navigator, "language", {
                    value: "en-US",
                });
            },
        });
        cy.contains("button", "Sign in");
    });

    it("translates the customer area, including API errors and plurals", () => {
        cy.visitAs("customer", "/customer/menu");
        cy.get("nav select").select("English");
        cy.contains("nav a", "My Orders");
        cy.contains("Most ordered");
        cy.contains("button", "Add to cart").first().click();
        cy.get('nav [aria-label="1 item in the cart"]');
        cy.contains("button", "Add to cart").click(); // the first one is now in the cart
        cy.get('nav [aria-label="2 items in the cart"]');
        cy.contains("nav a", "Cart").click();
        cy.contains("h1", "Cart");
        cy.contains("each");
        cy.snap("cart-english");
        cy.contains("button", "Sign out").click();
        cy.location("pathname").should("eq", "/login");
    });

    it("shows prices in reais with the formatting of the language", () => {
        cy.visitAs("customer", "/customer/menu");
        cy.contains("[data-slot=card]", "R$").contains(/R\$\s?\d+,\d{2}/);
        cy.get("nav select").select("English");
        cy.contains("[data-slot=card]", "R$").contains(/R\$\s?\d+\.\d{2}/);
    });

    it("translates API error messages", () => {
        cy.visit("/login");
        cy.get("select").select("English");
        cy.get("#email").type("customer@pizzaria.local");
        cy.get("input[name=password]").type("wrong-password");
        cy.contains("button", "Sign in").click();
        cy.get("[role=alert]").should("contain", "Invalid email or password");
    });

    it("falls back to English for an unsupported browser language", () => {
        cy.visit("/login", {
            onBeforeLoad(win) {
                win.localStorage.removeItem("lang");
                Object.defineProperty(win.navigator, "languages", {
                    value: ["fr-FR", "fr"],
                });
                Object.defineProperty(win.navigator, "language", {
                    value: "fr-FR",
                });
            },
        });
        cy.contains("button", "Sign in");
        cy.get("html").should("have.attr", "lang", "en");
    });

    describe("catalog translations", () => {
        const apiUrl = Cypress.expose("apiUrl") as string;

        it("shows menu items in the chosen language", () => {
            cy.visitAs("customer", "/customer/menu");
            cy.contains("[data-slot=card]", "Pizza de Mussarela");
            cy.get("nav select").select("English");
            cy.contains("[data-slot=card]", "Mozzarella Pizza");
            cy.contains("[data-slot=card]", "Pizza de Mussarela").should(
                "not.exist",
            );
            cy.get("nav select").select("Lietuvių");
            cy.contains("[data-slot=card]", "Mocarelos pica");
            cy.snap("menu-lithuanian");
        });

        it("serves the language of Accept-Language and the raw item on request", () => {
            cy.request("POST", `${apiUrl}/auth/login`, {
                email: "customer@pizzaria.local",
                password: Cypress.expose("seedPassword"),
            }).then(({ body }) => {
                const headers = { authorization: `Bearer ${body.token}` };
                cy.request({
                    url: `${apiUrl}/catalog/ingredients`,
                    headers: {
                        ...headers,
                        "accept-language": "lt-LT,lt;q=0.9",
                    },
                })
                    .its("body")
                    .should((items: { name: string }[]) =>
                        expect(items.map((i) => i.name)).to.include("Sūris"),
                    );
                cy.request({
                    url: `${apiUrl}/catalog/ingredients`,
                    headers: { ...headers, "accept-language": "fr" },
                })
                    .its("body")
                    .should((items: { name: string }[]) =>
                        expect(items.map((i) => i.name)).to.include("Cheese"),
                    );
                cy.request({
                    url: `${apiUrl}/catalog/ingredients?raw=1`,
                    headers: { ...headers, "accept-language": "lt" },
                }).then(({ body: raw }) => {
                    const cheese = raw.find(
                        (item: { name: string }) => item.name === "Cheese",
                    );
                    expect(cheese.translations["pt-BR"].name).to.equal(
                        "Queijo",
                    );
                });
            });
        });

        it("lets an admin translate a product, falling back to English elsewhere", () => {
            cy.visitAs("admin", "/admin/products");
            cy.get("#name").type("Spring Water 1L");
            cy.get("#price").clear().type("3");
            cy.get("#description").type("Still water");
            cy.get("#name-lt").type("Šaltinio vanduo 1 l");
            cy.get("#image").selectFile("cypress/fixtures/test-image.png");
            cy.snap("admin-product-translations");
            cy.contains("button", "Adicionar").click();
            cy.contains("[data-slot=card]", "Spring Water 1L");

            cy.visitAs("customer", "/customer/menu");
            // no Portuguese text: the English one is shown
            cy.contains("[data-slot=card]", "Spring Water 1L");
            cy.get("nav select").select("Lietuvių");
            cy.contains("[data-slot=card]", "Šaltinio vanduo 1 l");
            // the description was not translated, so it stays in English
            cy.contains("[data-slot=card]", "Still water");
        });

        it("keeps the translations when an admin edits the item", () => {
            cy.visitAs("admin", "/admin/products");
            cy.contains("[data-slot=card]", "Spring Water 1L")
                .contains("button", "Selecionar")
                .click();
            cy.get("#name-lt").should("have.value", "Šaltinio vanduo 1 l");
            cy.get("#name-pt-BR").type("Água 1L");
            cy.contains("button", "Salvar").click();

            cy.visitAs("customer", "/customer/menu");
            cy.contains("[data-slot=card]", "Água 1L");
        });
    });
});
