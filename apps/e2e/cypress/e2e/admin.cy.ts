describe("admin: catalog and users", () => {
    before(() => cy.resetDb());

    describe("products", () => {
        it("creates a product with an image", () => {
            cy.visitAs("admin", "/admin/products");
            cy.get("#name").type("Suco de Teste 1L");
            cy.get("#price").clear().type("6.5");
            cy.get("#description").type("Suco criado pelo Cypress");
            cy.get("#image").selectFile("cypress/fixtures/test-image.png");
            cy.contains("button", "Adicionar").click();

            cy.contains(".card-title", "Suco de Teste 1L");
        });

        it("shows the new product to customers", () => {
            cy.visitAs("customer", "/customer/menu");
            cy.contains("[data-slot=card]", "Suco de Teste 1L").within(() => {
                cy.contains("R$").should("contain", "6,50");
                cy.get("img").should(($img) => {
                    expect(
                        ($img[0] as HTMLImageElement).naturalWidth,
                    ).to.be.greaterThan(0);
                });
            });
        });

        it("edits the product", () => {
            cy.visitAs("admin", "/admin/products");
            cy.contains(".card-body", "Suco de Teste 1L")
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
            cy.contains(".card-body", "Suco de Teste 1L")
                .contains("button", "Selecionar")
                .click();
            cy.contains("button", "Deletar").click(); // window.confirm is auto-accepted
            cy.contains(".card-title", "Suco de Teste 1L").should("not.exist");
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
