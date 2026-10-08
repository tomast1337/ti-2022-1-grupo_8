describe("customer navigation", () => {
    before(() => cy.resetDb());

    describe("desktop", () => {
        beforeEach(() => {
            cy.viewport(1280, 800);
            cy.visitAs("customer", "/customer/menu");
        });

        it("shows every link inline and marks the current page", () => {
            cy.get("nav").within(() => {
                cy.contains("a", "Menu").should(
                    "have.attr",
                    "aria-current",
                    "page",
                );
                cy.contains("a", "Criar Pizza").should(
                    "not.have.attr",
                    "aria-current",
                );
                cy.contains("a", "Meus Pedidos").should("be.visible");
                cy.contains("a", "Carrinho").should("be.visible");
                cy.contains("button", "Sair").should("be.visible");
            });
            cy.get('button[aria-label="Abrir menu"]').should("not.be.visible");
        });

        it("navigates between pages", () => {
            cy.contains("nav a", "Criar Pizza").click();
            cy.location("pathname").should("eq", "/customer/build-pizza");
            cy.contains("nav a", "Criar Pizza").should(
                "have.attr",
                "aria-current",
                "page",
            );
        });

        it("counts the items in the cart", () => {
            cy.contains("nav a", "Carrinho")
                .find("[aria-label]")
                .should("not.exist");
            cy.contains("[data-slot=card]", "Coca Cola 2L")
                .contains("button", "Adicionar ao carrinho")
                .click();
            cy.contains("nav a", "Carrinho")
                .find('[aria-label="1 item no carrinho"]')
                .should("contain", "1");
        });
    });

    describe("mobile", () => {
        beforeEach(() => {
            cy.viewport(390, 844);
            cy.visitAs("customer", "/customer/menu");
        });

        it("hides the links behind a burger button", () => {
            cy.contains("nav a", "Meus Pedidos").should("not.be.visible");
            cy.contains("nav button", "Sair").should("not.be.visible");
            cy.get('button[aria-label="Abrir menu"]')
                .should("have.attr", "aria-expanded", "false")
                .click();
            cy.get('button[aria-label="Fechar menu"]').should(
                "have.attr",
                "aria-expanded",
                "true",
            );
            cy.contains("nav a", "Meus Pedidos").should("be.visible");
            cy.contains("nav button", "Sair").should("be.visible");
        });

        it("closes after choosing a page", () => {
            cy.get('button[aria-label="Abrir menu"]').click();
            cy.contains("nav a", "Carrinho").click();
            cy.location("pathname").should("eq", "/customer/cart");
            cy.contains("nav a", "Meus Pedidos").should("not.be.visible");
        });

        it("closes with Escape", () => {
            cy.get('button[aria-label="Abrir menu"]').click();
            cy.contains("nav a", "Meus Pedidos").should("be.visible");
            cy.get("body").type("{esc}");
            cy.contains("nav a", "Meus Pedidos").should("not.be.visible");
        });

        it("logs out from the burger menu", () => {
            cy.get('button[aria-label="Abrir menu"]').click();
            cy.contains("nav button", "Sair").click();
            cy.location("pathname").should("eq", "/login");
        });
    });
});
