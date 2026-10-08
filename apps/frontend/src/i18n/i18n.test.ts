import { describe, expect, it } from "vitest";
import i18next from "i18next";
import { LANGUAGES, resources, toSupportedLanguage } from "./index";
import { formatDateTime, formatMoney } from "./format";

type Tree = { [key: string]: string | Tree };

const keysOf = (tree: Tree, prefix = ""): string[] =>
    Object.entries(tree).flatMap(([key, value]) =>
        typeof value === "string"
            ? [`${prefix}${key}`]
            : keysOf(value, `${prefix}${key}.`),
    );

/** ICU placeholders such as {count} or {price}, ignoring plural branches. */
const placeholders = (text: string) =>
    [...text.matchAll(/\{(\w+)(?:,|\})/g)].map((m) => m[1]).sort();

const lookup = (tree: Tree, key: string): string =>
    key
        .split(".")
        .reduce<string | Tree>(
            (node, part) => (node as Tree)[part]!,
            tree,
        ) as string;

describe("translations", () => {
    const [base, ...others] = LANGUAGES;

    for (const language of others) {
        for (const namespace of Object.keys(resources[base])) {
            const source = resources[base][
                namespace as keyof (typeof resources)[typeof base]
            ] as Tree;
            const target = resources[language][
                namespace as keyof (typeof resources)[typeof base]
            ] as Tree;

            it(`${language}/${namespace} has exactly the keys of ${base}`, () => {
                expect(keysOf(target).sort()).toEqual(keysOf(source).sort());
            });

            it(`${language}/${namespace} uses the same placeholders`, () => {
                for (const key of keysOf(source)) {
                    expect(placeholders(lookup(target, key)), key).toEqual(
                        placeholders(lookup(source, key)),
                    );
                }
            });
        }
    }
});

describe("language handling", () => {
    it("maps browser codes to a shipped language", () => {
        expect(toSupportedLanguage("pt-BR")).toBe("pt-BR");
        expect(toSupportedLanguage("pt-PT")).toBe("pt-BR");
        expect(toSupportedLanguage("en-US")).toBe("en");
        expect(toSupportedLanguage("fr")).toBe("en");
        expect(toSupportedLanguage(undefined)).toBe("en");
    });

    it("handles plurals with ICU", async () => {
        await i18next.changeLanguage("en");
        expect(i18next.t("customer:nav.cartCount", { count: 1 })).toBe(
            "1 item in the cart",
        );
        expect(i18next.t("customer:nav.cartCount", { count: 3 })).toBe(
            "3 items in the cart",
        );
        await i18next.changeLanguage("pt-BR");
        expect(i18next.t("customer:nav.cartCount", { count: 3 })).toBe(
            "3 itens no carrinho",
        );
    });

    it("uses Lithuanian plural forms", async () => {
        await i18next.changeLanguage("lt");
        expect(i18next.t("customer:nav.cartCount", { count: 1 })).toBe(
            "1 prekė krepšelyje",
        );
        expect(i18next.t("customer:nav.cartCount", { count: 3 })).toBe(
            "3 prekės krepšelyje",
        );
        expect(i18next.t("customer:nav.cartCount", { count: 10 })).toBe(
            "10 prekių krepšelyje",
        );
        expect(toSupportedLanguage("lt-LT")).toBe("lt");
        await i18next.changeLanguage("pt-BR");
    });

    it("keeps prices in reais and follows the language for formatting", () => {
        expect(formatMoney(1234.5, "pt-BR")).toMatch(/R\$\s?1\.234,50/);
        expect(formatMoney(1234.5, "en")).toMatch(/R\$\s?1,234\.50/);
        expect(formatDateTime(undefined)).toBe("Sem Data");
    });
});
