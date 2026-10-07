import type { Ingredient, PizzaSize } from "@pizzaria/dtos";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { CustomerNav } from "../../components/customer/CustomerNav";
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
import { formatMoney, PIZZA_SIZE_LABEL } from "../../lib/format";
import { errorMessage, useGetIngredientsQuery } from "../../services/api";
import styles from "./BuildPizzaPage.module.scss";

const MAX_HALVES = 4;

const SIZE_BASE_PRICE: Record<PizzaSize, number> = {
    small: 10,
    medium: 15,
    large: 20,
    family: 25,
};

const SIZE_OPTIONS: { value: PizzaSize; label: string }[] = [
    { value: "small", label: "Pequena 🤏 15cm" },
    { value: "medium", label: "Media 🫄🏻 20cm" },
    { value: "large", label: "Grande 📏 25cm" },
    { value: "family", label: "Família 😱 40cm" },
];

const SAUCE_NAME = "Molho";
const NAME_PREFIXES = ["de", "com", "e"];

/** Builds a name like "Pizza Grande de Queijo com Tomate" from random picks. */
const buildPizzaName = (
    size: PizzaSize,
    halves: string[][],
    all: Ingredient[],
) => {
    const names = [...new Set(halves.flat())]
        .map((id) => all.find((ingredient) => ingredient.id === id)?.name)
        .filter((name): name is string => !!name && name !== SAUCE_NAME);

    let name = `Pizza ${PIZZA_SIZE_LABEL[size]}`;
    for (const prefix of NAME_PREFIXES) {
        if (names.length === 0) break;
        const [picked] = names.splice(
            Math.floor(Math.random() * names.length),
            1,
        );
        name += ` ${prefix} ${picked}`;
    }
    return name;
};

export const BuildPizzaPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { size, halves } = useAppSelector(selectBuilder);
    const {
        data: ingredients = [],
        isLoading,
        error,
    } = useGetIngredientsQuery();
    const [showSizeError, setShowSizeError] = useState(false);

    const sizeError = size === null ? "Selecione um tamanho" : "";

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
                name: buildPizzaName(size, halves, ingredients),
                price,
                quantity: 1,
                size,
                halves,
                description: "Ingredientes: " + names.join(", "),
            }),
        );
        dispatch(builderReset());
        void navigate("/customer/cart");
    };

    return (
        <div className={styles.body}>
            <CustomerNav current="build-pizza" />
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="container">
                    <div className="row">
                        <h1 className="text-center">Monte sua pizza 🍕</h1>
                    </div>
                    <div className="row">
                        <h5
                            className="text-center"
                            id="error-message"
                            style={{ color: "red" }}
                        >
                            {showSizeError ? sizeError : ""}
                            {error ? errorMessage(error) : ""}
                        </h5>
                    </div>
                    <div className="row section">
                        <p>
                            <b>Tamanho</b>
                        </p>
                        <div>
                            <div className="form-check form-switch">
                                <div
                                    className="tamanho p-2"
                                    style={{
                                        width: "50%",
                                        fontSize: "1.25rem",
                                    }}
                                >
                                    {SIZE_OPTIONS.map((option) => (
                                        <div
                                            className="col mb-1"
                                            key={option.value}
                                        >
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                id={`size-${option.value}`}
                                                name="size"
                                                value={option.value}
                                                checked={size === option.value}
                                                onChange={() =>
                                                    handleSizeChange(
                                                        option.value,
                                                    )
                                                }
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor={`size-${option.value}`}
                                            >
                                                {option.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row" style={{ textAlign: "center" }}>
                        <h3 id="ingredients">Ingredientes</h3>
                        <h4
                            style={{
                                color: "white",
                                textShadow: "1px 1px 4px black",
                            }}
                        >
                            Escolha até {MAX_INGREDIENTS_PER_HALF} em cada
                            metade
                        </h4>
                    </div>
                    {isLoading ? (
                        <p className="text-center">Carregando...</p>
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

                    <div className="row section">
                        <div className="col-sm-12" style={{ display: "flex" }}>
                            {halves.length > 1 && (
                                <button
                                    type="button"
                                    style={{ width: "100%" }}
                                    className="btn btn-danger"
                                    onClick={handleRemoveHalf}
                                >
                                    Remover Metade
                                </button>
                            )}
                            {halves.length < MAX_HALVES && (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ width: "100%" }}
                                    onClick={handleAddHalf}
                                >
                                    Adicionar Metade
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <hr />
                <div
                    className="row"
                    style={{
                        textAlign: "right",
                        marginBottom: "20px",
                        marginRight: "10%",
                    }}
                >
                    <div className="col-md-12">
                        <h3>Preço total:</h3>
                        <h3>
                            {size === null
                                ? "Tamanho não selecionado"
                                : formatMoney(price)}
                        </h3>
                    </div>
                </div>
            </form>
            <div
                className="row section"
                style={{
                    textAlign: "center",
                    marginLeft: "auto",
                    marginRight: "auto",
                    width: "80%",
                    marginBottom: "1rem",
                }}
            >
                <button
                    type="button"
                    className="btn btn-primary mb-3"
                    onClick={handleAddToCart}
                >
                    Adicionar ao carrinho
                </button>

                <Link to="/customer/menu" className="btn btn-danger">
                    Cancelar
                </Link>
            </div>
        </div>
    );
};
