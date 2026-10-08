import type { Ingredient, PizzaSize } from "@pizzaria/dtos";
import {
    ArrowLeft,
    Minus,
    Pizza,
    Plus,
    ShoppingCart,
    Wand2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { CustomerNav } from "../../components/customer/CustomerNav";
import { CustomerPage } from "../../components/customer/CustomerPage";
import { Alert } from "../../components/ui/Alert";
import { Button, buttonClass } from "../../components/ui/Button";
import { cn } from "../../components/ui/cn";
import { Panel } from "../../components/ui/Panel";
import {
    HalfPizza,
    MAX_INGREDIENTS_PER_HALF,
} from "../../components/customer/HalfPizza";
import { itemAdded } from "../../features/cart/cartSlice";
import {
    builderReset,
    halfCountChanged,
    halfIngredientsChanged,
    selectBuilder,
    sizeChosen,
} from "../../features/pizzaBuilder/pizzaBuilderSlice";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../../i18n/format";
import type { TFunction } from "i18next";
import { errorMessage, useGetIngredientsQuery } from "../../services/api";

const MAX_HALVES = 4;

const SIZE_BASE_PRICE: Record<PizzaSize, number> = {
    small: 10,
    medium: 15,
    large: 20,
    family: 25,
};

const SIZE_OPTIONS: { value: PizzaSize; diameter: string; icon: string }[] = [
    { value: "small", diameter: "15cm", icon: "size-7" },
    { value: "medium", diameter: "20cm", icon: "size-9" },
    { value: "large", diameter: "25cm", icon: "size-11" },
    { value: "family", diameter: "40cm", icon: "size-14" },
];

const SAUCE_NAME = "Molho";
const NAME_PREFIXES = ["of", "with", "and"] as const;

/** Builds a name like "Pizza Grande de Queijo com Tomate" from random picks. */
const buildPizzaName = (
    size: PizzaSize,
    halves: string[][],
    all: Ingredient[],
    t: TFunction<["customer", "common"]>,
) => {
    const names = [...new Set(halves.flat())]
        .map((id) => all.find((ingredient) => ingredient.id === id)?.name)
        .filter((name): name is string => !!name && name !== SAUCE_NAME);

    let name = t("builder.name", { size: t(`common:pizzaSize.${size}`) });
    for (const prefix of NAME_PREFIXES) {
        if (names.length === 0) break;
        const [picked] = names.splice(
            Math.floor(Math.random() * names.length),
            1,
        );
        name += ` ${t(`builder.joiners.${prefix}`)} ${picked}`;
    }
    return name;
};

export const BuildPizzaPage = () => {
    const { t } = useTranslation(["customer", "common"]);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { size, halves } = useAppSelector(selectBuilder);
    const {
        data: ingredients = [],
        isLoading,
        error,
    } = useGetIngredientsQuery();
    const [showSizeError, setShowSizeError] = useState(false);

    const sizeError = size === null ? t("builder.sizeRequired") : "";

    const price =
        size === null
            ? 0
            : SIZE_BASE_PRICE[size] +
              halves
                  .flat()
                  .reduce(
                      (sum, id) =>
                          sum +
                          (ingredients.find((i) => i.id === id)?.price ?? 0),
                      0,
                  );

    const scrollToHalf = (index: number) =>
        document
            .getElementById(`half-scroll-${index}`)
            ?.scrollIntoView({ behavior: "smooth" });

    const handleSizeChange = (value: PizzaSize) => {
        dispatch(sizeChosen(value));
        setShowSizeError(false);
        document
            .getElementById("ingredients")
            ?.scrollIntoView({ behavior: "smooth" });
    };

    const handleAddHalf = () => {
        if (halves.length >= MAX_HALVES) return;
        dispatch(halfCountChanged(halves.length + 1));
        scrollToHalf(halves.length - 1);
    };

    const handleRemoveHalf = () => {
        if (halves.length <= 1) return;
        dispatch(halfCountChanged(halves.length - 1));
        scrollToHalf(halves.length - 2);
    };

    const handleAddToCart = () => {
        if (size === null) {
            setShowSizeError(true);
            document
                .getElementById("error-message")
                ?.scrollIntoView({ behavior: "auto", block: "center" });
            return;
        }
        const names = halves
            .flat()
            .map((id) => ingredients.find((i) => i.id === id)?.name)
            .filter((name): name is string => !!name);
        dispatch(
            itemAdded({
                type: "custom_pizza",
                id: crypto.randomUUID(),
                name: buildPizzaName(size, halves, ingredients, t),
                price,
                quantity: 1,
                size,
                halves,
                description: t("builder.description", {
                    list: names.join(", "),
                }),
            }),
        );
        dispatch(builderReset());
        void navigate("/customer/cart");
    };

    return (
        <CustomerPage>
            <CustomerNav current="build-pizza" />
            <main className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-6 pb-44">
                <h1 className="flex items-center justify-center gap-3 text-center text-4xl font-extrabold tracking-wide text-white uppercase [text-shadow:1px_2px_6px_rgb(0_0_0/0.55)] sm:text-5xl">
                    <Wand2 className="size-9" aria-hidden />
                    {t("builder.title")}
                </h1>

                <div id="error-message" role="alert" aria-live="polite">
                    {showSizeError || error ? (
                        <Alert>
                            {showSizeError ? sizeError : errorMessage(error)}
                        </Alert>
                    ) : null}
                </div>

                <Panel className="p-5">
                    <fieldset className="m-0 border-0 p-0">
                        <legend className="mb-3 text-xl font-extrabold text-ink">
                            {t("builder.step1")}
                        </legend>
                        <div
                            id="size-options"
                            className="grid grid-cols-2 gap-3 md:grid-cols-4"
                        >
                            {SIZE_OPTIONS.map((option) => {
                                const selected = size === option.value;
                                return (
                                    <div key={option.value}>
                                        <input
                                            id={`size-${option.value}`}
                                            type="radio"
                                            name="size"
                                            value={option.value}
                                            className="peer sr-only"
                                            checked={selected}
                                            onChange={() =>
                                                handleSizeChange(option.value)
                                            }
                                        />
                                        <label
                                            htmlFor={`size-${option.value}`}
                                            className={cn(
                                                "flex h-full cursor-pointer flex-col items-center justify-end gap-1 rounded-2xl border-2 bg-white px-3 py-4 text-center shadow-sm transition",
                                                "hover:-translate-y-0.5 hover:shadow-md",
                                                "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tomato-600",
                                                selected
                                                    ? "border-tomato-600 bg-tomato-50 shadow-md"
                                                    : "border-transparent",
                                            )}
                                        >
                                            <span className="flex h-16 items-end">
                                                <Pizza
                                                    className={cn(
                                                        option.icon,
                                                        selected
                                                            ? "text-tomato-600"
                                                            : "text-cheese-600",
                                                    )}
                                                    aria-hidden
                                                />
                                            </span>
                                            <span className="text-lg font-extrabold text-ink">
                                                {t(
                                                    `common:pizzaSize.${option.value}`,
                                                )}
                                            </span>
                                            <span className="text-sm font-semibold text-ink/60">
                                                {option.diameter}
                                            </span>
                                            <span className="text-base font-bold text-ink">
                                                {formatMoney(
                                                    SIZE_BASE_PRICE[
                                                        option.value
                                                    ],
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </fieldset>
                </Panel>

                <div id="ingredients" className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-wide text-white uppercase [text-shadow:1px_2px_6px_rgb(0_0_0/0.55)]">
                        {t("builder.step2")}
                    </h2>
                    <p className="mt-1 text-lg font-semibold text-white [text-shadow:1px_1px_4px_black]">
                        {t("builder.limit", { max: MAX_INGREDIENTS_PER_HALF })}
                    </p>
                </div>

                {isLoading ? (
                    <p className="text-center text-lg font-semibold">
                        {t("loading")}
                    </p>
                ) : null}

                {halves.map((selectedIds, index) => (
                    <HalfPizza
                        key={index}
                        index={index}
                        ingredients={ingredients}
                        selectedIds={selectedIds}
                        onChange={(ingredientIds) =>
                            dispatch(
                                halfIngredientsChanged({
                                    index,
                                    ingredientIds,
                                }),
                            )
                        }
                    />
                ))}

                <div className="flex flex-wrap justify-center gap-3">
                    {halves.length > 1 && (
                        <Button variant="danger" onClick={handleRemoveHalf}>
                            <Minus className="size-5" aria-hidden />
                            {t("builder.removeHalf")}
                        </Button>
                    )}
                    {halves.length < MAX_HALVES && (
                        <Button variant="ghost" onClick={handleAddHalf}>
                            <Plus className="size-5" aria-hidden />
                            {t("builder.addHalf")}
                        </Button>
                    )}
                </div>
            </main>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 shadow-[0_-8px_30px_rgb(35_24_21/0.18)] backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
                    <div>
                        <p className="m-0 text-sm font-bold tracking-wide text-ink/60 uppercase">
                            {t("builder.totalPrice")}
                        </p>
                        <p
                            data-slot="price"
                            className="m-0 text-2xl leading-tight font-extrabold text-ink"
                        >
                            {size === null
                                ? t("builder.noSize")
                                : formatMoney(price)}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/customer/menu"
                            className={buttonClass({ variant: "ghost" })}
                        >
                            <ArrowLeft className="size-5" aria-hidden />
                            {t("common:actions.cancel")}
                        </Link>
                        <Button onClick={handleAddToCart}>
                            <ShoppingCart className="size-5" aria-hidden />
                            {t("card.addToCart")}
                        </Button>
                    </div>
                </div>
            </div>
        </CustomerPage>
    );
};
