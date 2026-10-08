import type { LoginResponse, Product } from "@pizzaria/dtos";
import { accounts } from "../support/commands";

const apiUrl = () => Cypress.expose("apiUrl") as string;

const login = (role: keyof typeof accounts) =>
    cy
        .request<LoginResponse>("POST", `${apiUrl()}/auth/login`, {
            email: accounts[role],
            password: Cypress.expose("seedPassword"),
        })
        .its("body.token");

/** Places `count` one-drink orders as the customer and returns their ids. */
const placeOrders = (count: number) =>
    login("customer").then((token) => {
        const headers = { authorization: `Bearer ${token}` };
        return cy
            .request<Product[]>({
                url: `${apiUrl()}/catalog/products`,
                headers,
            })
            .then(({ body: products }) => {
                const product = products[0];
                if (!product) throw new Error("seed has no products");
                const ids: string[] = [];
                for (let i = 0; i < count; i++) {
                    cy.request({
                        method: "POST",
                        url: `${apiUrl()}/customer/orders`,
                        headers,
                        body: {
                            address: `Rua ${i + 1}, ${i + 1}`,
                            items: [
                                {
                                    type: "product",
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    quantity: i + 1,
                                },
                            ],
                        },
                    }).then(({ body }) => {
                        ids.push(body.id);
                    });
                }
                return cy.wrap(ids);
            });
    });

const advance = (ids: string[], action: "start" | "complete") =>
    login("employee").then((token) => {
        for (const id of ids) {
            cy.request({
                method: "POST",
                url: `${apiUrl()}/employee/orders/${id}/${action}`,
                headers: { authorization: `Bearer ${token}` },
            });
        }
    });

describe("employee order queue", () => {
    beforeEach(() => cy.resetDb());

    it("shows three empty columns when there are no orders", () => {
        cy.visitAs("employee", "/employee/orders");
        cy.contains("[data-slot=column]", "Pendentes").should(
            "contain",
            "Nenhum pedido pendente!",
        );
        cy.contains("[data-slot=column]", "Em andamento").should(
            "contain",
            "Nenhum pedido em andamento!",
        );
        cy.contains("[data-slot=column]", "Prontos").should(
            "contain",
            "Nenhum pedido concluído!",
        );
    });

    it("counts the orders in each column and shows item quantities", () => {
        placeOrders(3).then((ids) => advance(ids.slice(0, 1), "start"));
        cy.visitAs("employee", "/employee/orders");
        cy.contains("[data-slot=column]", "Pendentes")
            .find("[data-slot=count]")
            .should("have.text", "2");
        cy.contains("[data-slot=column]", "Em andamento")
            .find("[data-slot=count]")
            .should("have.text", "1");
        cy.contains("[data-slot=column]", "Prontos")
            .find("[data-slot=count]")
            .should("have.text", "0");
        cy.contains("[data-slot=column]", "Pendentes").within(() => {
            cy.contains("2x");
            cy.contains("3x");
            cy.contains("customer@pizzaria.local");
        });
        cy.snap("employee-queue-counts");
    });

    it("moves an order one step at a time and updates the counts", () => {
        placeOrders(1);
        cy.visitAs("employee", "/employee/orders");
        cy.contains("[data-slot=column]", "Pendentes")
            .contains("button", "Avançar")
            .click();
        cy.contains("[data-slot=column]", "Pendentes")
            .find("[data-slot=count]")
            .should("have.text", "0");
        cy.contains("[data-slot=column]", "Em andamento").within(() => {
            cy.get("[data-slot=count]").should("have.text", "1");
            cy.contains("button", "Avançar").click();
        });
        cy.contains("[data-slot=column]", "Prontos").within(() => {
            cy.get("[data-slot=count]").should("have.text", "1");
            cy.contains("[data-slot=order]", "Concluído");
            cy.contains("button", "Avançar").should("not.exist");
        });
    });

    it("lists only the 4 most recent finished orders", () => {
        placeOrders(6).then((ids) => {
            advance(ids, "start");
            advance(ids, "complete");
        });
        cy.visitAs("employee", "/employee/orders");
        const column = () => cy.contains("[data-slot=column]", "Prontos");
        column().find("[data-slot=count]").should("have.text", "6");
        column().find("[data-slot=order]").should("have.length", 4);
    });

    it("has a single nav link, the current page, and logs out", () => {
        cy.visitAs("employee", "/employee/orders");
        cy.contains("nav a", "Pedidos").should(
            "have.attr",
            "aria-current",
            "page",
        );
        cy.contains("nav button", "Sair").click();
        cy.location("pathname").should("eq", "/login");
    });

    it("stacks the columns on a phone", () => {
        cy.viewport(390, 844);
        cy.visitAs("employee", "/employee/orders");
        cy.contains("[data-slot=column]", "Pendentes").should("be.visible");
        cy.snap("employee-queue-mobile");
        cy.contains("[data-slot=column]", "Prontos")
            .scrollIntoView()
            .should("be.visible");
        cy.get("body").then(($body) => {
            expect($body[0]!.scrollWidth).to.be.at.most(390);
        });
    });
});
