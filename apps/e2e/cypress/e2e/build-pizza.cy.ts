import type {
    Ingredient,
    LoginResponse,
    Order,
    PizzaSize,
} from "@pizzaria/dtos";
import seed from "../../../backend/src/db/seed-data.json";
import { accounts } from "../support/commands";

const SIZE_PRICE: Record<PizzaSize, number> = {
    small: 10,
    medium: 15,
    large: 20,
    family: 25,
};

/** Seed price of an ingredient, so the spec does not hardcode catalog data. */
const ingredientPrice = (name: string): number => {
    const ingredient = seed.ingredients.find((i) => i.name === name);
    if (!ingredient) throw new Error(`Unknown seed ingredient ${name}`);
    return ingredient.price;
};

const expectedPrice = (size: PizzaSize, names: string[]): number =>
    Math.round(
        (SIZE_PRICE[size] + names.reduce((s, n) => s + ingredientPrice(n), 0)) *
            100,
    ) / 100;

/** pt-BR money digits, e.g. 21.98 -> "21,98" (the currency symbol uses a non-breaking space). */
const brl = (value: number): string => value.toFixed(2).replace(".", ",");

const half = (n: number) => cy.contains("[data-slot=half]", `Metade ${n}`);
const toggle = (n: number, name: string) =>
    half(n).contains("label", name).click();
const chooseSize = (size: PizzaSize) =>
    cy.get(`label[for=size-${size}]`).click();

const apiLogin = (role: keyof typeof accounts) =>
    cy
        .request<LoginResponse>(
            "POST",
            `${Cypress.expose("apiUrl")}/auth/login`,
            {
                email: accounts[role],
                password: Cypress.expose("seedPassword"),
            },
        )
        .its("body.token");

describe("build your own pizza", () => {
    before(() => cy.resetDb());

    beforeEach(() => cy.visitAs("customer", "/customer/build-pizza"));

    it("is reachable from the menu", () => {
        cy.visitAs("customer", "/customer/menu");
        cy.contains("a", "Clique aqui").click();
        cy.location("pathname").should("eq", "/customer/build-pizza");
        cy.contains("h1", "Monte sua pizza");
        cy.contains("Metade 1");
    });

    it("requires a size before adding to the cart", () => {
        cy.contains("Tamanho não selecionado");
        cy.contains("button", "Adicionar ao carrinho").click();
        cy.contains("Selecione um tamanho");
        cy.snap("builder-size-required");
        cy.location("pathname").should("eq", "/customer/build-pizza");

        chooseSize("small");
        cy.contains("Selecione um tamanho").should("not.exist");
    });

    it("updates the price live with size and ingredients", () => {
        chooseSize("large");
        cy.get("[data-slot=price]").should(
            "contain",
            brl(expectedPrice("large", [])),
        );

        toggle(1, "Queijo");
        cy.get("[data-slot=price]").should(
            "contain",
            brl(expectedPrice("large", ["Queijo"])),
        );

        toggle(1, "Molho");
        cy.get("[data-slot=price]").should(
            "contain",
            brl(expectedPrice("large", ["Queijo", "Molho"])),
        );

        // another size keeps the chosen ingredients
        chooseSize("family");
        cy.get("[data-slot=price]").should(
            "contain",
            brl(expectedPrice("family", ["Queijo", "Molho"])),
        );

        // unchecking removes the ingredient's price again
        toggle(1, "Queijo");
        cy.get("[data-slot=price]").should(
            "contain",
            brl(expectedPrice("family", ["Molho"])),
        );
    });

    it("accepts at most 7 ingredients per half", () => {
        const eight = [
            "Molho",
            "Queijo",
            "Bacon",
            "Tomate",
            "Cebola",
            "Alho",
            "Ovo",
            "Presunto",
        ];
        for (const name of eight) toggle(1, name);

        half(1).find('input[type="checkbox"]:checked').should("have.length", 7);
        half(1).should("contain", "7/7 ingredientes");
        half(1)
            .contains("[data-slot=ingredient]", "Presunto")
            .find("input")
            .should("be.disabled");
        half(1)
            .contains("[data-slot=ingredient]", "Presunto")
            .find("input")
            .should("not.be.checked");
    });

    it("adds and removes halves, from 1 up to 4", () => {
        cy.contains("button", "Remover Metade").should("not.exist");

        for (const n of [2, 3, 4]) {
            cy.contains("button", "Adicionar Metade").click();
            cy.contains(`Metade ${n}`);
        }
        cy.contains("button", "Adicionar Metade").should("not.exist");

        cy.contains("button", "Remover Metade").click();
        cy.contains("Metade 4").should("not.exist");
        cy.contains("button", "Adicionar Metade").should("exist");
    });

    it("keeps each half's ingredients separate", () => {
        cy.contains("button", "Adicionar Metade").click();
        toggle(1, "Queijo");
        toggle(2, "Bacon");

        half(1)
            .contains("[data-slot=ingredient]", "Queijo")
            .find("input")
            .should("be.checked");
        half(1)
            .contains("[data-slot=ingredient]", "Bacon")
            .find("input")
            .should("not.be.checked");
        half(2)
            .contains("[data-slot=ingredient]", "Bacon")
            .find("input")
            .should("be.checked");
        half(2)
            .contains("[data-slot=ingredient]", "Queijo")
            .find("input")
            .should("not.be.checked");
    });

    it("turns a custom pizza into an order priced by the server", () => {
        const half1 = ["Molho", "Queijo"];
        const half2 = ["Bacon"];
        const total = expectedPrice("large", [...half1, ...half2]);

        chooseSize("large");
        cy.contains("button", "Adicionar Metade").click();
        for (const name of half1) toggle(1, name);
        for (const name of half2) toggle(2, name);
        cy.get("[data-slot=price]").should("contain", brl(total));
        cy.snap("builder-size-and-halves");
        cy.contains("[data-slot=half]", "Metade 2").scrollIntoView();
        cy.snap("builder-ingredients");
        cy.contains("button", "Adicionar ao carrinho").click();

        // cart
        cy.location("pathname").should("eq", "/customer/cart");
        cy.contains("[data-slot=cart-item]", /Pizza Grande/);
        cy.contains(brl(total));
        cy.snap("builder-pizza-in-cart");

        // checkout
        cy.get('input[placeholder="Endereço"]').type("Rua da Meia Pizza, 7");
        cy.contains("button", "Finalizar Compra").click();
        cy.location("pathname").should("eq", "/customer/orders");
        cy.contains(/Pizza Grande/);
        cy.contains(`Total: R$`).should("contain", brl(total));

        // the stored order has both halves and the server-side price
        apiLogin("employee").then((token) => {
            cy.request<Order[]>({
                url: `${Cypress.expose("apiUrl")}/employee/orders`,
                headers: { authorization: `Bearer ${token}` },
            }).then(({ body }) => {
                const item = body
                    .flatMap((order) => order.items)
                    .find((i) => i.type === "custom_pizza");
                expect(item, "custom pizza in the order").to.exist;
                if (item?.type !== "custom_pizza") return;
                expect(item.size).to.eq("large");
                expect(item.halves).to.have.length(2);
                expect(item.halves.map((h) => h.length)).to.deep.eq([2, 1]);
                expect(item.price).to.be.closeTo(total, 0.001);
            });
        });
    });

    it("ignores a price tampered with by the client", () => {
        apiLogin("customer").then((token) => {
            const headers = { authorization: `Bearer ${token}` };
            cy.request<Ingredient[]>({
                url: `${Cypress.expose("apiUrl")}/catalog/ingredients`,
                headers,
            }).then(({ body: ingredients }) => {
                const cheese = ingredients.find((i) => i.name === "Queijo")!;
                cy.request({
                    method: "POST",
                    url: `${Cypress.expose("apiUrl")}/customer/orders`,
                    headers,
                    body: {
                        address: "Rua do Hacker, 1",
                        items: [
                            {
                                type: "custom_pizza",
                                id: "tampered",
                                name: "Free pizza",
                                price: 0.01,
                                quantity: 1,
                                size: "family",
                                halves: [[cheese.id]],
                                description: "",
                            },
                        ],
                    },
                }).then(({ status, body }) => {
                    expect(status).to.eq(201);
                    expect(body.items[0].price).to.be.closeTo(
                        expectedPrice("family", ["Queijo"]),
                        0.001,
                    );
                });
            });
        });
    });
});
