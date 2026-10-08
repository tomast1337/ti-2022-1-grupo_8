import type { Translations } from "@pizzaria/dtos";

/** Language codes of an Accept-Language header, best first ("pt-BR,pt;q=0.9" → ["pt-br", "pt"]). */
export const parseAcceptLanguage = (header: string | undefined): string[] =>
    (header ?? "")
        .split(",")
        .map((part) => {
            const [tag = "", ...params] = part.trim().split(";");
            const q = params.find((p) => p.trim().startsWith("q="));
            return {
                tag: tag.trim().toLowerCase(),
                q: q ? Number(q.trim().slice(2)) : 1,
            };
        })
        .filter(({ tag, q }) => tag && tag !== "*" && q > 0)
        .sort((a, b) => b.q - a.q)
        .map(({ tag }) => tag);

interface Localizable {
    name: string;
    description: string;
    translations?: Translations;
}

/**
 * Returns the item with `name`/`description` in the first requested language
 * that has them; anything missing keeps the default (English) text.
 * `translations` is dropped: clients get one language at a time.
 */
export const localize = <T extends Localizable>(
    item: T,
    languages: string[],
): Omit<T, "translations"> => {
    const { translations = {}, ...rest } = item;
    const byCode = new Map(
        Object.entries(translations).map(([code, value]) => [
            code.toLowerCase(),
            value,
        ]),
    );
    for (const tag of languages) {
        // exact ("pt-br") first, then the same base language ("pt" matches "pt-BR")
        const found =
            byCode.get(tag) ??
            [...byCode].find(
                ([code]) => code.split("-")[0] === tag.split("-")[0],
            )?.[1];
        if (found) {
            return {
                ...rest,
                name: found.name || rest.name,
                description: found.description || rest.description,
            };
        }
    }
    return rest;
};

/** Drops blank fields and empty languages before storing. */
export const cleanTranslations = (translations: Translations): Translations =>
    Object.fromEntries(
        Object.entries(translations)
            .map(
                ([code, value]) =>
                    [
                        code,
                        {
                            ...(value.name ? { name: value.name } : {}),
                            ...(value.description
                                ? { description: value.description }
                                : {}),
                        },
                    ] as const,
            )
            .filter(([, value]) => Object.keys(value).length > 0),
    );
