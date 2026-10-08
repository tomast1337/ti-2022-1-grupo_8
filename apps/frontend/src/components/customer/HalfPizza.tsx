import type { Ingredient } from "@pizzaria/dtos";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../../i18n/format";
import { imageUrl } from "../../lib/images";
import { Badge } from "../ui/badge";
import { cn } from "../ui/cn";
import { Panel } from "../ui/Panel";

export const MAX_INGREDIENTS_PER_HALF = 7;

interface HalfPizzaProps {
    index: number;
    ingredients: Ingredient[];
    selectedIds: string[];
    onChange: (ingredientIds: string[]) => void;
    maxIngredients?: number;
}

export const HalfPizza = ({
    index,
    ingredients,
    selectedIds,
    onChange,
    maxIngredients = MAX_INGREDIENTS_PER_HALF,
}: HalfPizzaProps) => {
    const { t } = useTranslation("customer");
    const full = selectedIds.length >= maxIngredients;

    const handleToggle = (id: string, checked: boolean) => {
        if (!checked) {
            onChange(selectedIds.filter((selected) => selected !== id));
        } else if (!full) {
            onChange([...selectedIds, id]);
        }
    };

    return (
        <Panel data-slot="half" id={`half-scroll-${index}`} className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="m-0 font-sans text-2xl font-extrabold tracking-normal text-ink normal-case [text-shadow:none]">
                    {t("half.title", { number: index + 1 })}
                </h3>
                <Badge tone={full ? "warning" : "default"}>
                    {t("half.count", {
                        selected: selectedIds.length,
                        max: maxIngredients,
                    })}
                </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {ingredients.map((ingredient) => {
                    const inputId = `half-${index}-${ingredient.id}`;
                    const checked = selectedIds.includes(ingredient.id);
                    const blocked = full && !checked;
                    return (
                        <div
                            key={ingredient.id}
                            data-slot="ingredient"
                            className="relative"
                        >
                            <input
                                id={inputId}
                                type="checkbox"
                                className="peer sr-only"
                                checked={checked}
                                disabled={blocked}
                                onChange={(e) =>
                                    handleToggle(
                                        ingredient.id,
                                        e.target.checked,
                                    )
                                }
                            />
                            <label
                                htmlFor={inputId}
                                className={cn(
                                    "flex h-full cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-transparent bg-white p-2 text-center shadow-sm transition",
                                    "hover:-translate-y-0.5 hover:shadow-md",
                                    "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tomato-600",
                                    checked &&
                                        "border-basil-600 bg-basil-600/5 shadow-md",
                                    blocked &&
                                        "cursor-not-allowed opacity-45 hover:translate-y-0 hover:shadow-sm",
                                )}
                            >
                                <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-[#fff4e0]">
                                    <img
                                        src={imageUrl(ingredient.image)}
                                        alt=""
                                        loading="lazy"
                                        className="size-full object-cover"
                                    />
                                    {checked && (
                                        <span className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-basil-600 text-white shadow">
                                            <Check
                                                className="size-4"
                                                aria-hidden
                                            />
                                        </span>
                                    )}
                                </span>
                                <span className="text-base leading-tight font-bold text-ink">
                                    {ingredient.name}
                                </span>
                                <span className="text-sm font-semibold text-ink/60">
                                    {formatMoney(ingredient.price)}
                                </span>
                            </label>
                        </div>
                    );
                })}
            </div>
        </Panel>
    );
};
