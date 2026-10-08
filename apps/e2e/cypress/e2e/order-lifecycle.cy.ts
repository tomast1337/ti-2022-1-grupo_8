/**
 * One order travels through the whole system:
 * customer places it -> employee prepares it -> customer sees it ready -> admin report counts it.
 * Tests run in order and share the state created by the previous ones.
 */
describe("order lifecycle", () => {
    before(() => cy.resetDb());

    // Cypress clears localStorage between tests, and the cart lives there,
    // so the whole customer part is a single test.
    it("customer fills the cart, keeps it across a reload and places the order", () => {
        cy.visitAs("customer", "/customer/menu");

        cy.contains("[data-slot=card]", "Pizza de Mussarela").within(() => {
            cy.contains("button", "Adicionar ao carrinho").click();
            cy.contains("Produto no carrinho!");
        });
        cy.contains("[data-slot=card]", "Refrigerante Cola 2L").within(() => {
            cy.contains("button", "Adicionar ao carrinho").click();
        });

        // the cart survives a full page reload
        cy.reload();
        cy.contains("Produto no carrinho!");

        cy.visit("/customer/cart");
        cy.contains("td", "Pizza de Mussarela");
        cy.contains("td", "Refrigerante Cola 2L");
        // pizza 21.12 + drink 8.00 (seed prices)
        cy.contains("29,12");

        // an address is required before checkout
        cy.contains("button", "Finalizar Compra").should("be.disabled");
        cy.get('input[placeholder="Endereço"]').type("Rua das Pizzas, 42");
        cy.contains("button", "Finalizar Compra").should("be.enabled").click();

        cy.location("pathname").should("eq", "/customer/orders");
        cy.contains("Meus Pedidos");
        cy.contains(".badge", "Pendente");
        cy.contains("Pizza de Mussarela");

        // the cart was emptied
        cy.visit("/customer/cart");
        cy.contains("Carrinho vazio!");
    });

    it("employee sees the order and moves it to in progress", () => {
        cy.visitAs("employee", "/employee/orders");
        cy.contains(".col-md-4", "Pendentes").within(() => {
            cy.contains("customer@pizzaria.local");
            cy.contains("Rua das Pizzas, 42");
            cy.contains("Refrigerante Cola 2L");
            cy.contains("2x").should("not.exist");
        });
    });

    it("employee advances the order through the queue", () => {
        cy.visitAs("employee", "/employee/orders");

        cy.contains(".col-md-4", "Pendentes").within(() => {
            cy.contains("button", "Avançar").click();
        });
        cy.contains(".col-md-4", "Em andamento").within(() => {
            cy.contains("customer@pizzaria.local");
            cy.contains("button", "Avançar").click();
        });
        cy.contains(".col-md-4", "Prontos").within(() => {
            cy.contains("customer@pizzaria.local");
            cy.contains("button", "Avançar").should("not.exist");
        });
    });

    it("customer sees the order as ready", () => {
        cy.visitAs("customer", "/customer/orders");
        cy.contains(".badge", "Pronto");
    });

    it("admin report counts the sold items", () => {
        cy.visitAs("admin", "/admin");
        cy.contains("tr", "Pizza de Mussarela").should("contain", "1");
        cy.contains("tr", "Refrigerante Cola 2L").should("contain", "1");
    });
});
