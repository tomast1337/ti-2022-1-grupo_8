import type { Translation, Translations } from "@pizzaria/dtos";
import { useTranslation } from "react-i18next";
import { DEFAULT_LANGUAGE, LANGUAGES } from "../../i18n";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";

interface TranslationFieldsProps {
    value: Translations;
    onChange: (value: Translations) => void;
}

/**
 * Name and description in every language but the default one, which is the
 * form's own name/description. Empty fields fall back to the default text.
 */
export const TranslationFields = ({
    value,
    onChange,
}: TranslationFieldsProps) => {
    const { t } = useTranslation(["admin", "common"]);
    const others = LANGUAGES.filter((code) => code !== DEFAULT_LANGUAGE);

    const set = (code: string, field: keyof Translation, text: string) =>
        onChange({ ...value, [code]: { ...value[code], [field]: text } });

    return (
        <div className="space-y-3">
            <p className="m-0 text-sm font-semibold text-ink/70">
                {t("translations.hint", {
                    language: t(`common:language.${DEFAULT_LANGUAGE}`),
                })}
            </p>
            {others.map((code) => (
                <fieldset
                    key={code}
                    data-slot="translation"
                    className="m-0 min-w-0 space-y-3 rounded-xl border border-ink/15 p-4"
                >
                    <legend className="px-2 text-base font-extrabold text-ink">
                        {t(`common:language.${code}`)}
                    </legend>
                    <Field label={t("fields.name")} htmlFor={`name-${code}`}>
                        <Input
                            type="text"
                            id={`name-${code}`}
                            value={value[code]?.name ?? ""}
                            onChange={(e) => set(code, "name", e.target.value)}
                        />
                    </Field>
                    <Field
                        label={t("fields.description")}
                        htmlFor={`description-${code}`}
                    >
                        <Textarea
                            id={`description-${code}`}
                            value={value[code]?.description ?? ""}
                            onChange={(e) =>
                                set(code, "description", e.target.value)
                            }
                        />
                    </Field>
                </fieldset>
            ))}
        </div>
    );
};
