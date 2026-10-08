describe("unknown routes", () => {
    it("shows the 404 page with a way back", () => {
        cy.visit("/isso/nao/existe");
        cy.contains("h1", "Nem uma pizza por aqui!");
        cy.snap("not-found");
        cy.contains("a", "Voltar para o início").click();
        cy.location("pathname").should("eq", "/login");
    });
});
