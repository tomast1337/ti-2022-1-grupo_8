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
});
