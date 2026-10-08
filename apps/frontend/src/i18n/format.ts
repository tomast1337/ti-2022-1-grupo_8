import { useTranslation } from "react-i18next";
import i18next from "i18next";

/** Prices are always in reais; only the number formatting follows the language. */
export const formatMoney = (value: number, locale = i18next.language) =>
    new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "BRL",
    }).format(value);

export const formatDateTime = (
    iso: string | undefined,
    locale = i18next.language,
): string => {
    if (!iso) return i18next.t("common:noDate");
    return new Intl.DateTimeFormat(locale, {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(iso));
};

/**
 * Formatters bound to the active language. Using the hook makes the component
 * re-render when the language changes.
 */
export const useFormat = () => {
    const { i18n } = useTranslation();
    return {
        money: (value: number) => formatMoney(value, i18n.language),
        dateTime: (iso: string | undefined) =>
            formatDateTime(iso, i18n.language),
    };
};
