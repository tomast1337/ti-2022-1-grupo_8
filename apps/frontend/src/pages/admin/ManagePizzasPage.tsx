import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import type { Pizza } from "@pizzaria/dtos";
import { AdminNav } from "../../components/admin/AdminNav";
import {
    errorMessage,
    useDeletePizzaMutation,
    useGetIngredientsQuery,
    useGetPizzasQuery,
    useSavePizzaMutation,
} from "../../services/api";
import { formatMoney } from "../../lib/format";
import { imageUrl } from "../../lib/images";
import styles from "./ManagePizzasPage.module.scss";

/** Base price added by the API on top of the ingredient prices. */
const BASE_PRICE = 20;

/** Admin page to create, edit and delete pizzas. */
export const ManagePizzasPage = () => {
    const navigate = useNavigate();
    const { data: pizzas = [], isLoading, error } = useGetPizzasQuery();
    const { data: ingredients = [], error: ingredientsError } =
        useGetIngredientsQuery();
    const [savePizza, { isLoading: saving }] = useSavePizzaMutation();
    const [deletePizza, { isLoading: deleting }] = useDeletePizzaMutation();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [ingredientIds, setIngredientIds] = useState<string[]>([]);
    const [image, setImage] = useState<File | null>(null);
    // changing the key remounts the file input, clearing it
    const [fileKey, setFileKey] = useState(0);
    const [formError, setFormError] = useState("");

    const price = ingredients
        .filter((ingredient) => ingredientIds.includes(ingredient.id))
        .reduce((total, ingredient) => total + ingredient.price, BASE_PRICE);

    const reset = () => {
        setSelectedId(null);
        setName("");
        setDescription("");
        setIngredientIds([]);
        setImage(null);
        setFileKey((key) => key + 1);
        setFormError("");
    };

    const toggleSelected = (pizza: Pizza) => {
        if (selectedId === pizza.id) {
            reset();
            return;
        }
        setSelectedId(pizza.id);
        setName(pizza.name);
        setDescription(pizza.description);
        setIngredientIds(pizza.ingredientIds);
        setImage(null);
        setFileKey((key) => key + 1);
        setFormError("");
    };

    const toggleIngredient = (id: string, checked: boolean) =>
        setIngredientIds((current) =>
            checked
                ? [...current.filter((item) => item !== id), id]
                : current.filter((item) => item !== id),
        );

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        if (ingredientIds.length === 0) {
            setFormError("Selecione ao menos um ingrediente");
            return;
        }
        const body = new FormData();
        body.append("name", name);
        body.append("description", description);
        body.append("ingredientIds", ingredientIds.join(","));
        if (image) body.append("image", image);
        try {
            await savePizza({
                id: selectedId ?? undefined,
                form: body,
            }).unwrap();
            reset();
        } catch (err) {
            setFormError(errorMessage(err));
        }
    };

    const handleDeleteOrCancel = async () => {
        if (!selectedId) {
            navigate(-1);
            return;
        }
        if (!window.confirm("Deseja realmente excluir esta pizza?")) return;
        try {
            await deletePizza(selectedId).unwrap();
            reset();
        } catch (err) {
            setFormError(errorMessage(err));
        }
    };

    return (
        <div className={styles.body}>
            <AdminNav current="pizzas" />
            <h1 style={{ textAlign: "center" }}> Gerenciar Pizzas 🍕 </h1>
            <div className="container">
                {(error || ingredientsError) && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage(error ?? ingredientsError)}
                    </div>
                )}
                <div className="row m-1 section">
                    {isLoading && <p>Carregando...</p>}
                    {/* Existing pizzas */}
                    <div className="scrollmenu">
                        {pizzas.map((pizza) => (
                            <div
                                style={{
                                    width: "18rem",
                                    margin: "0.5rem",
                                    border: "1px solid #ccc",
                                    borderRadius: "0.25rem",
                                    padding: "1rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                                key={pizza.id}
                            >
                                <img
                                    className="card-img-top"
                                    src={imageUrl(pizza.image)}
                                    alt={pizza.name}
                                    style={{
                                        width: "12rem",
                                        height: "12rem",
                                        objectFit: "cover",
                                        borderRadius: "0.25rem",
                                    }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{pizza.name}</h5>
                                    <button
                                        type="button"
                                        className="btn btn-lg btn-primary btn-success"
                                        onClick={() => toggleSelected(pizza)}
                                    >
                                        {selectedId === pizza.id
                                            ? "Desselecionar"
                                            : "Selecionar"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Create / edit form */}
                <div className="row m-1 section">
                    <form id="form-pizza" onSubmit={handleSave}>
                        {formError && (
                            <div className="alert alert-danger" role="alert">
                                {formError}
                            </div>
                        )}
                        <div className="form-group mb-2">
                            <label htmlFor="name">Nome</label>
                            <input
                                type="text"
                                className="form-control"
                                id="name"
                                placeholder="Nome"
                                autoComplete="off"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label htmlFor="description">Descrição</label>
                            <textarea
                                className="form-control"
                                id="description"
                                placeholder="Descrição"
                                autoComplete="off"
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label htmlFor="image">Imagem</label>
                            <input
                                key={fileKey}
                                type="file"
                                accept="image/*"
                                className="form-control"
                                id="image"
                                required={!selectedId}
                                onChange={(e) =>
                                    setImage(e.target.files?.[0] ?? null)
                                }
                            />
                        </div>
                        <div className="scrollmenu">
                            {ingredients.map((ingredient) => (
                                <div className="ingredient" key={ingredient.id}>
                                    <label
                                        className="form-check-label"
                                        htmlFor={`ingredient-${ingredient.id}`}
                                    >
                                        {ingredient.name}
                                    </label>
                                    <br />
                                    <img
                                        src={imageUrl(ingredient.image)}
                                        alt={ingredient.name}
                                        style={{
                                            width: "100px",
                                            borderRadius: "10px",
                                        }}
                                    />
                                    <br />
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                        }}
                                        id={`ingredient-${ingredient.id}`}
                                        checked={ingredientIds.includes(
                                            ingredient.id,
                                        )}
                                        onChange={(e) =>
                                            toggleIngredient(
                                                ingredient.id,
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <p>{formatMoney(ingredient.price)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="row">
                            <div
                                className="col-md-12"
                                style={{
                                    textAlign: "right",
                                    marginBottom: "20px",
                                }}
                            >
                                <h3>Preço total:</h3>
                                <h3>{formatMoney(price)}</h3>
                            </div>
                        </div>
                        <div className="row section">
                            <button
                                type="submit"
                                className="btn btn-lg btn-success"
                                disabled={saving}
                            >
                                {selectedId ? "Salvar 💿" : "Adicionar ✅"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-lg btn-danger"
                                onClick={handleDeleteOrCancel}
                                disabled={deleting}
                            >
                                {selectedId ? "Deletar 🗑️" : "Cancelar ❌"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
