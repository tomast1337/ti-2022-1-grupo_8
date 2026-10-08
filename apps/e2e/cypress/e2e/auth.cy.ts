describe("authentication", () => {
    before(() => cy.resetDb());

    it("sends anonymous visitors to the login page", () => {
        cy.visit("/");
        cy.location("pathname").should("eq", "/login");

        cy.visit("/customer/menu");
        cy.location("pathname").should("eq", "/login");

        cy.visit("/admin");
        cy.location("pathname").should("eq", "/login");
    });

    it("rejects a wrong password", () => {
        cy.loginViaUi("customer@pizzaria.local", "wrong-password");
        cy.get("[role=alert]").should("contain", "Invalid email or password");
        cy.location("pathname").should("eq", "/login");
    });

    it("rejects a malformed email without calling the API", () => {
        cy.intercept("POST", "**/auth/login").as("login");
        cy.visit("/login");
        cy.get('input[name="email"]').type("not-an-email{enter}");
        cy.location("pathname").should("eq", "/login");
        cy.get("@login.all").should("have.length", 0);
    });

    const homes = [
        {
            role: "customer",
            email: "customer@pizzaria.local",
            home: "/customer/menu",
        },
        {
            role: "employee",
            email: "employee@pizzaria.local",
            home: "/employee/orders",
        },
        { role: "admin", email: "admin@pizzaria.local", home: "/admin" },
    ];
    for (const { role, email, home } of homes) {
        it(`logs in as ${role} and lands on ${home}`, () => {
            cy.loginViaUi(email, Cypress.expose("seedPassword") as string);
            cy.location("pathname").should("eq", home);
        });
    }

    it("registers a new customer who can then log in", () => {
        cy.visit("/register");
        cy.get('input[name="name"]').type("Maria Teste");
        cy.get('input[name="email"]').type("maria@example.com");
        cy.get('input[name="password"]').type("secret123");
        cy.get('input[name="confirmPassword"]').type("secret123");
        cy.contains("button", "Cadastrar").click();
        cy.location("pathname").should("eq", "/login");

        cy.loginViaUi("maria@example.com", "secret123");
        cy.location("pathname").should("eq", "/customer/menu");
    });

    it("validates the registration form", () => {
        cy.visit("/register");
        cy.get('input[name="name"]').type("Maria");
        cy.get('input[name="email"]').type("maria2@example.com");
        cy.get('input[name="password"]').type("secret123");
        cy.get('input[name="confirmPassword"]').type("different");
        cy.contains("button", "Cadastrar").click();
        cy.contains("Senhas não conferem");
        cy.location("pathname").should("eq", "/register");
    });

    it("refuses an email that is already registered", () => {
        cy.visit("/register");
        cy.get('input[name="name"]').type("Dup");
        cy.get('input[name="email"]').type("customer@pizzaria.local");
        cy.get('input[name="password"]').type("secret123");
        cy.get('input[name="confirmPassword"]').type("secret123");
        cy.contains("button", "Cadastrar").click();
        cy.contains("Email already registered");
    });

    it("keeps each role out of the other areas", () => {
        cy.visitAs("customer", "/admin");
        cy.location("pathname").should("eq", "/customer/menu");

        cy.visitAs("employee", "/customer/cart");
        cy.location("pathname").should("eq", "/employee/orders");

        cy.visitAs("admin", "/employee/orders");
        cy.location("pathname").should("eq", "/admin");
    });

    it("logs out", () => {
        cy.visitAs("customer", "/customer/menu");
        cy.contains("button", "Sair").click();
        cy.location("pathname").should("eq", "/login");
        cy.visit("/customer/menu");
        cy.location("pathname").should("eq", "/login");
    });

    it("signs out when the API rejects the token", () => {
        cy.intercept("GET", "**/catalog/pizzas", {
            statusCode: 401,
            body: { error: "Invalid or expired token" },
        });
        cy.visitAs("customer", "/customer/menu");
        // the 401 clears the session and the route guard sends the user away
        cy.location("pathname").should("eq", "/login");
        cy.window()
            .its("localStorage")
            .invoke("getItem", "session")
            .should("be.null");
    });
});
