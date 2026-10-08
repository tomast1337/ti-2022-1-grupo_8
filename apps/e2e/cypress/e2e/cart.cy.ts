const addFromMenu = (name: string) =>
    cy
        .contains("[data-slot=card]", name)
        .contains("button", "Adicionar ao carrinho")
        .click();

describe("cart and orders pages", () => {
    before(() => cy.resetDb());

    it("shows the empty states", () => {
        cy.visitAs("customer", "/customer/cart");
        cy.contains("Carrinho vazio!");
        cy.snap("cart-empty");
        cy.contains("a", "Voltar para o menu").click();
        cy.location("pathname").should("eq", "/customer/menu");

        cy.visit("/customer/orders");
        cy.contains("Poxa, nenhum pedido!");
        cy.snap("orders-empty");
        cy.contains("a", "Ver o menu").should("be.visible");
    });

    describe("with items", () => {
        beforeEach(() => {
            cy.visitAs("customer", "/customer/menu");
            addFromMenu("Pizza de Mussarela");
            addFromMenu("Refrigerante Cola 2L");
            cy.visit("/customer/cart");
        });

        it("changes quantities and recomputes subtotal and total", () => {
            cy.contains("[data-slot=cart-item]", "Refrigerante Cola 2L").within(
                () => {
                    cy.get("[data-slot=subtotal]").should("contain", "8,00");
                    cy.get('button[aria-label="Aumentar quantidade"]')
                        .click()
                        .click();
                    cy.get("[data-slot=quantity]").should("have.text", "3");
                    cy.get("[data-slot=subtotal]").should("contain", "24,00");
                    cy.get('button[aria-label="Diminuir quantidade"]').click();
                    cy.get("[data-slot=quantity]").should("have.text", "2");
                },
            );
            // pizza 21.12 + 2 x 8.00
            cy.get("[data-slot=total]").should("contain", "37,12");
            cy.snap("cart-quantities");
        });

        it("does not go below one unit", () => {
            cy.contains("[data-slot=cart-item]", "Pizza de Mussarela")
                .find('button[aria-label="Diminuir quantidade"]')
                .should("be.disabled");
        });

        it("removes one item", () => {
            cy.get('button[aria-label="Remover Refrigerante Cola 2L"]').click();
            cy.contains("[data-slot=cart-item]", "Refrigerante Cola 2L").should(
                "not.exist",
            );
            cy.get("[data-slot=total]").should("contain", "21,12");
        });

        it("clears the whole cart", () => {
            cy.contains("button", "Limpar Carrinho").click();
            cy.contains("Carrinho vazio!");
        });

        it("needs an address to check out", () => {
            cy.contains("button", "Finalizar Compra").should("be.disabled");
            cy.get("#address").type("   ");
            cy.contains("button", "Finalizar Compra").should("be.disabled");
            cy.get("#address").clear().type("Rua Nova, 1");
            cy.contains("button", "Finalizar Compra").should("be.enabled");
        });
    });

    it("lists a placed order with its status badge and total", () => {
        cy.visitAs("customer", "/customer/menu");
        addFromMenu("Refrigerante Cola 2L");
        cy.visit("/customer/cart");
        cy.get("#address").type("Rua dos Pedidos, 5");
        cy.contains("button", "Finalizar Compra").click();

        cy.location("pathname").should("eq", "/customer/orders");
        cy.contains("[data-slot=order]", "Refrigerante Cola 2L").within(() => {
            cy.contains("[data-slot=badge]", "Pendente");
            cy.contains("1x");
            cy.contains("Total:").should("contain", "8,00");
        });
    });
});
