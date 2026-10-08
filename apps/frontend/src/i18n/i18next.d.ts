import type { resources, DEFAULT_LANGUAGE } from "./index";

// typed keys: t("auth:login.title") fails to compile if the key is missing from pt-BR
declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: "common";
        resources: (typeof resources)[typeof DEFAULT_LANGUAGE];
    }
}
