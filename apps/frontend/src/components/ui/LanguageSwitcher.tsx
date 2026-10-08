import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LANGUAGES, toSupportedLanguage } from "../../i18n";

/** Picks the interface language; the choice is remembered by the detector. */
export const LanguageSwitcher = ({ className }: { className?: string }) => {
    const { t, i18n } = useTranslation();
    return (
        <label className={`flex items-center gap-2 ${className ?? ""}`}>
            <Languages className="size-5" aria-hidden />
            <span className="sr-only">{t("language.label")}</span>
            <select
                value={toSupportedLanguage(i18n.language)}
                onChange={(e) => void i18n.changeLanguage(e.target.value)}
                className="cursor-pointer rounded-lg border border-ink/20 bg-white px-2 py-1.5 text-base font-semibold text-ink"
            >
                {LANGUAGES.map((code) => (
                    <option key={code} value={code}>
                        {t(`language.${code}`)}
                    </option>
                ))}
            </select>
        </label>
    );
};
