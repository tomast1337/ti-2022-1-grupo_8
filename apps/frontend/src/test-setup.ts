import "@testing-library/jest-dom/vitest";
import i18next from "i18next";
import "./i18n";

// jsdom reports en-US; tests assert the default language
await i18next.changeLanguage("pt-BR");
