import "./commands";

// The app follows the browser language and remembers the user's choice in
// localStorage ("lang"); the specs assert Portuguese, so every page load starts there.
Cypress.on("window:before:load", (win) => {
    if (!win.localStorage.getItem("lang")) {
        win.localStorage.setItem("lang", "pt-BR");
    }
});
