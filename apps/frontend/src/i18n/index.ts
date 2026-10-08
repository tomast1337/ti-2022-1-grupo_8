import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ICU from "i18next-icu";
import { initReactI18next } from "react-i18next";
import enAdmin from "../locales/en/admin.json";
import ltAdmin from "../locales/lt/admin.json";
import enAuth from "../locales/en/auth.json";
import ltAuth from "../locales/lt/auth.json";
import enCommon from "../locales/en/common.json";
import ltCommon from "../locales/lt/common.json";
import enCustomer from "../locales/en/customer.json";
import ltCustomer from "../locales/lt/customer.json";
import enEmployee from "../locales/en/employee.json";
import ltEmployee from "../locales/lt/employee.json";
import ptAdmin from "../locales/pt-BR/admin.json";
import ptAuth from "../locales/pt-BR/auth.json";
import ptCommon from "../locales/pt-BR/common.json";
import ptCustomer from "../locales/pt-BR/customer.json";
import ptEmployee from "../locales/pt-BR/employee.json";

/**
 * To add a language: create `locales/<code>/*.json`, register it here and in
 * LANGUAGES. The default language (en) files are the source of truth for the key types.
 */
export const LANGUAGES = ["en", "pt-BR", "lt"] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";
export const LANGUAGE_STORAGE_KEY = "lang";

export const resources = {
    "pt-BR": {
        common: ptCommon,
        auth: ptAuth,
        customer: ptCustomer,
        employee: ptEmployee,
        admin: ptAdmin,
    },
    en: {
        common: enCommon,
        auth: enAuth,
        customer: enCustomer,
        employee: enEmployee,
        admin: enAdmin,
    },
    lt: {
        common: ltCommon,
        auth: ltAuth,
        customer: ltCustomer,
        employee: ltEmployee,
        admin: ltAdmin,
    },
} as const;

/** Maps whatever the browser reports ("en-US", "pt-PT"...) to a language we ship. */
export const toSupportedLanguage = (code: string | undefined): Language =>
    LANGUAGES.find((language) => language === code) ??
    LANGUAGES.find(
        (language) => code?.split("-")[0] === language.split("-")[0],
    ) ??
    DEFAULT_LANGUAGE;

await i18next
    .use(ICU)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        supportedLngs: [...LANGUAGES],
        fallbackLng: DEFAULT_LANGUAGE,
        defaultNS: "common",
        ns: Object.keys(resources[DEFAULT_LANGUAGE]),
        interpolation: { escapeValue: false }, // React already escapes
        detection: {
            order: ["localStorage", "navigator"],
            lookupLocalStorage: LANGUAGE_STORAGE_KEY,
            caches: ["localStorage"],
            convertDetectedLanguage: toSupportedLanguage,
        },
    });

const syncDocumentLanguage = (code: string) => {
    document.documentElement.lang = code;
};
syncDocumentLanguage(i18next.language);
i18next.on("languageChanged", syncDocumentLanguage);

export default i18next;
