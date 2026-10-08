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
        cy.get("[role=alert]").should("contain", "E-mail ou senha inválidos");
        cy.snap("login-wrong-password");
        cy.location("pathname").should("eq", "/login");
    });

    it("treats the email as case-insensitive", () => {
        cy.loginViaUi(
            "  Customer@Pizzaria.LOCAL ",
            Cypress.expose("seedPassword") as string,
        );
        cy.location("pathname").should("eq", "/customer/menu");
    });

    it("refuses a password shorter than 8 characters when registering", () => {
        cy.visit("/register");
        cy.get('input[name="name"]').type("Curta");
        cy.get('input[name="email"]').type("curta@example.com");
        cy.get('input[name="password"]').type("abc1234");
        cy.get('input[name="confirmPassword"]').type("abc1234");
        cy.contains("button", "Cadastrar").click();
        cy.get("[role=alert]").should("contain", "entre 8 e 72");
        cy.location("pathname").should("eq", "/register");
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
            cy.snap(`home-${role}`);
        });
    }

    it("registers a new customer who can then log in", () => {
        cy.visit("/register");
        cy.get('input[name="name"]').type("Maria Teste");
        cy.get('input[name="email"]').type("maria@example.com");
        cy.get('input[name="password"]').type("secret123");
        cy.get('input[name="confirmPassword"]').type("secret123");
        cy.snap("register-form");
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
        cy.contains("E-mail já cadastrado");
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
        cy.intercept("POST", "**/auth/logout").as("logout");
        cy.visitAs("customer", "/customer/menu");
        cy.contains("button", "Sair").click();
        cy.location("pathname").should("eq", "/login");
        cy.wait("@logout");
        cy.visit("/customer/menu");
        cy.location("pathname").should("eq", "/login");
    });

    it("keeps the session across a reload", () => {
        cy.visitAs("customer", "/customer/menu");
        cy.reload();
        cy.location("pathname").should("eq", "/customer/menu");
        cy.contains("Mais pedidas");
    });

    it("keeps the credentials out of reach of page scripts", () => {
        cy.visitAs("customer", "/customer/menu");
        cy.getCookie("refresh_token").should("have.property", "httpOnly", true);
        cy.getCookie("refresh_token").should("have.property", "path", "/auth");
        cy.window().then((win) => {
            expect(win.document.cookie).to.not.contain("refresh_token");
            expect(win.localStorage.getItem("session")).to.equal(null);
            expect(JSON.stringify({ ...win.localStorage })).to.not.match(
                /eyJ/, // a JWT
            );
        });
    });

    it("renews an expired access token without bothering the user", () => {
        // only the first call fails, like a token that just ran out
        cy.intercept(
            { method: "GET", url: "**/catalog/pizzas", times: 1 },
            {
                statusCode: 401,
                body: { error: "Invalid or expired token" },
            },
        ).as("expired");
        cy.visitAs("customer", "/customer/menu");
        cy.wait("@expired");
        // the client refreshed the session and repeated the request
        cy.location("pathname").should("eq", "/customer/menu");
        cy.contains("[data-slot=card]", "Pizza de Mussarela");
    });

    it("signs out when the session can no longer be renewed", () => {
        cy.visitAs("customer", "/customer/menu");
        cy.contains("Mais pedidas");
        cy.clearCookies(); // refresh cookie gone, like an expired or revoked login
        cy.intercept("GET", "**/customer/orders", {
            statusCode: 401,
            body: { error: "Invalid or expired token" },
        });
        cy.contains("a", "Meus Pedidos").click();
        cy.location("pathname").should("eq", "/login");
    });

    describe("refresh tokens", () => {
        const api = () => Cypress.expose("apiUrl") as string;
        const headers = (cookie: string) => ({
            cookie: `refresh_token=${cookie}`,
            "x-requested-by": "pizzaria",
        });
        const cookieValue = (res: Cypress.Response<unknown>) => {
            const header = ([] as string[]).concat(
                res.headers["set-cookie"] ?? [],
            )[0];
            return /refresh_token=([^;]+)/.exec(header ?? "")?.[1] ?? "";
        };
        const login = () =>
            cy.request({
                method: "POST",
                url: `${api()}/auth/login`,
                body: {
                    email: "customer@pizzaria.local",
                    password: Cypress.expose("seedPassword"),
                },
            });
        const refresh = (cookie: string) =>
            cy.request({
                method: "POST",
                url: `${api()}/auth/refresh`,
                headers: headers(cookie),
                failOnStatusCode: false,
            });

        beforeEach(() => cy.clearCookies());

        it("rotates the token on every refresh", () => {
            login().then((first) => {
                const original = cookieValue(first);
                expect(original).to.not.equal("");
                refresh(original).then((second) => {
                    expect(second.status).to.equal(200);
                    expect(second.body.token).to.be.a("string");
                    expect(cookieValue(second)).to.not.equal(original);
                });
            });
        });

        it("revokes the whole login when an old token is replayed", () => {
            login().then((first) => {
                const original = cookieValue(first);
                refresh(original).then((second) => {
                    const rotated = cookieValue(second);
                    // wait out the short grace window used for parallel tabs
                    cy.wait(1500);
                    refresh(original).its("status").should("eq", 401); // replay
                    refresh(rotated).its("status").should("eq", 401); // family is gone
                });
            });
        });

        it("tolerates two tabs refreshing with the same token", () => {
            login().then((first) => {
                const original = cookieValue(first);
                refresh(original);
                // second request right behind the first: new access token, no rotation
                refresh(original).then((again) => {
                    expect(again.status).to.equal(200);
                    expect(again.body.token).to.be.a("string");
                });
            });
        });

        it("refuses a refresh without the CSRF header", () => {
            login().then((first) => {
                cy.request({
                    method: "POST",
                    url: `${api()}/auth/refresh`,
                    headers: { cookie: `refresh_token=${cookieValue(first)}` },
                    failOnStatusCode: false,
                })
                    .its("status")
                    .should("eq", 403);
            });
        });

        it("logout revokes the refresh token", () => {
            login().then((first) => {
                const token = cookieValue(first);
                cy.request({
                    method: "POST",
                    url: `${api()}/auth/logout`,
                    headers: headers(token),
                })
                    .its("status")
                    .should("eq", 204);
                refresh(token).its("status").should("eq", 401);
            });
        });
    });
});
