import { describe, expect, it } from "vitest";
import {
    cleanTranslations,
    localize,
    parseAcceptLanguage,
} from "./localize.js";

const item = {
    id: "1",
    name: "Ham",
    description: "Ham slices",
    translations: {
        "pt-BR": { name: "Presunto", description: "Fatias de presunto" },
        lt: { name: "Kumpis" },
    },
};

describe("parseAcceptLanguage", () => {
    it("orders by quality and drops wildcards", () => {
        expect(
            parseAcceptLanguage("en;q=0.5, pt-BR, lt;q=0.8, *;q=0.1"),
        ).toEqual(["pt-br", "lt", "en"]);
        expect(parseAcceptLanguage(undefined)).toEqual([]);
    });
});

describe("localize", () => {
    it("uses the first language that has a translation", () => {
        expect(localize(item, ["fr", "pt-br"]).name).toBe("Presunto");
    });

    it("matches the base language of a regional tag", () => {
        expect(localize(item, ["pt"]).description).toBe("Fatias de presunto");
        expect(localize(item, ["pt-pt"]).name).toBe("Presunto");
    });

    it("falls back to the default text per field", () => {
        const lt = localize(item, ["lt"]);
        expect(lt.name).toBe("Kumpis");
        expect(lt.description).toBe("Ham slices");
    });

    it("keeps the default text for unknown languages and hides translations", () => {
        const result = localize(item, ["de"]);
        expect(result).toEqual({
            id: "1",
            name: "Ham",
            description: "Ham slices",
        });
        expect("translations" in result).toBe(false);
    });
});

describe("cleanTranslations", () => {
    it("drops blank fields and empty languages", () => {
        expect(
            cleanTranslations({
                "pt-BR": { name: "Presunto", description: "" },
                lt: { name: "", description: "" },
            }),
        ).toEqual({ "pt-BR": { name: "Presunto" } });
    });
});
