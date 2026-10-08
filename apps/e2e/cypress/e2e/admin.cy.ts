describe("admin: catalog and users", () => {
    before(() => cy.resetDb());
    // cy.viewport persists across tests, so every test starts desktop-sized
    beforeEach(() => cy.viewport(1280, 720));

    describe("navigation", () => {
        it("links every section and marks the current one", () => {
            cy.visitAs("admin", "/admin");
            for (const label of [
                "Relatórios",
                "Ingredientes",
                "Pizzas",
                "Produtos",
                "Usuários",
            ]) {
                cy.contains("nav a", label);
            }
            cy.contains("nav a", "Relatórios").should(
                "have.attr",
                "aria-current",
                "page",
            );
            cy.contains("nav a", "Produtos").click();
            cy.location("pathname").should("eq", "/admin/products");
            cy.contains("nav a", "Produtos").should(
                "have.attr",
                "aria-current",
                "page",
            );
        });

        it("collapses into a burger menu on a phone", () => {
            cy.viewport(390, 844);
            cy.visitAs("admin", "/admin");
            cy.contains("nav a", "Pizzas").should("not.be.visible");
            cy.get('button[aria-label="Abrir menu"]').click();
            cy.contains("nav a", "Pizzas").click();
            cy.location("pathname").should("eq", "/admin/pizzas");
        });
    });

    describe("products", () => {
        it("creates a product with an image", () => {
            cy.visitAs("admin", "/admin/products");
            cy.get("#name").type("Suco de Teste 1L");
            cy.get("#price").clear().type("6.5");
            cy.get("#description").type("Suco criado pelo Cypress");
            cy.get("#image").selectFile("cypress/fixtures/test-image.png");
            cy.contains("button", "Adicionar").click();

            cy.contains("[data-slot=card]", "Suco de Teste 1L");
        });

        it("shows the new product to customers", () => {
            cy.visitAs("customer", "/customer/menu");
            cy.contains("[data-slot=card]", "Suco de Teste 1L").within(() => {
                cy.contains("R$").should("contain", "6,50");
                // lazy images load once scrolled into view
                cy.get("img").scrollIntoView();
                cy.get("img").should(($img) => {
                    expect(
                        ($img[0] as HTMLImageElement).naturalWidth,
                    ).to.be.greaterThan(0);
                });
            });
        });

        it("edits the product", () => {
            cy.visitAs("admin", "/admin/products");
            cy.contains("[data-slot=card]", "Suco de Teste 1L")
                .contains("button", "Selecionar")
                .click();
            cy.get("#price").clear().type("7.9");
            cy.contains("button", "Salvar").click();

            cy.visitAs("customer", "/customer/menu");
            cy.contains("[data-slot=card]", "Suco de Teste 1L").should(
                "contain",
                "7,90",
            );
        });

        it("deletes the product", () => {
            cy.visitAs("admin", "/admin/products");
            cy.contains("[data-slot=card]", "Suco de Teste 1L")
                .contains("button", "Selecionar")
                .click();
            cy.contains("button", "Deletar").click(); // window.confirm is auto-accepted
            cy.contains("[data-slot=card]", "Suco de Teste 1L").should(
                "not.exist",
            );
        });
    });

    describe("ingredients and pizzas", () => {
        it("creates an ingredient", () => {
            cy.visitAs("admin", "/admin/ingredients");
            cy.get("#name").type("Rúcula");
            cy.get("#price").clear().type("1.2");
            cy.get("#description").type("Rúcula fresca");
            cy.get("#portionWeight").clear().type("30");
            cy.get("#image").selectFile("cypress/fixtures/test-image.png");
            cy.contains("button", "Adicionar").click();
            cy.contains("Rúcula");
        });

        it("updates the pizza price as ingredients are picked", () => {
            cy.visitAs("admin", "/admin/pizzas");
            cy.get("[data-slot=price]").should("contain", "20,00");
            cy.contains("[data-slot=ingredient]", "Rúcula").click();
            cy.get("[data-slot=price]").should("contain", "21,20");
            cy.contains("[data-slot=ingredient]", "Rúcula").click();
            cy.get("[data-slot=price]").should("contain", "20,00");
        });

        it("refuses a pizza without ingredients", () => {
            cy.visitAs("admin", "/admin/pizzas");
            cy.get("#name").type("Pizza Vazia");
            cy.get("#description").type("Sem ingredientes");
            cy.get("#image").selectFile("cypress/fixtures/test-image.png");
            cy.contains("button", "Adicionar").click();
            cy.contains("Selecione ao menos um ingrediente");
        });
    });

    describe("users and reports", () => {
        it("promotes a customer to employee", () => {
            cy.visitAs("admin", "/admin/users");
            cy.get("#search").type("customer@");
            cy.contains("tr", "customer@pizzaria.local")
                .contains("button", "Selecionar")
                .click();
            cy.contains("label", "Funcionário").click();
            cy.get("#role-employee").should("be.checked");
            cy.contains("button", "Confirmar").click();

            // back to the list, which shows the new role
            cy.contains("button", "Voltar").click();
            cy.contains("tr", "customer@pizzaria.local").should(
                "contain",
                "Funcionário",
            );
        });

        it("the promoted user now lands on the employee area", () => {
            cy.loginViaUi(
                "customer@pizzaria.local",
                Cypress.expose("seedPassword") as string,
            );
            cy.location("pathname").should("eq", "/employee/orders");
        });

        it("deletes a user", () => {
            cy.visitAs("admin", "/admin/users");
            cy.get("#search").type("customer@");
            cy.contains("tr", "customer@pizzaria.local")
                .contains("button", "Selecionar")
                .click();
            cy.contains("button", "Excluir").click();
            cy.get("#search").type("customer@");
            cy.contains("customer@pizzaria.local").should("not.exist");
        });

        it("renders the report page with its date filters", () => {
            cy.visitAs("admin", "/admin");
            cy.contains("h1", "Relatórios");
            cy.get("#from").type("2020-01-01");
            cy.get("#to").type("2020-01-31");
            cy.contains("Pizzas Mais Compradas");
        });
    });
});
