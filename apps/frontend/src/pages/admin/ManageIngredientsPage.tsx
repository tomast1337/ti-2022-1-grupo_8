import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import type { Ingredient } from "@pizzaria/dtos";
import { AdminNav } from "../../components/admin/AdminNav";
import {
    errorMessage,
    useDeleteIngredientMutation,
    useGetIngredientsQuery,
    useSaveIngredientMutation,
} from "../../services/api";
import { formatMoney } from "../../lib/format";
import { imageUrl } from "../../lib/images";
import styles from "./ManageIngredientsPage.module.scss";

interface FormState {
    name: string;
    price: string;
    description: string;
    portionWeight: string;
}

const EMPTY_FORM: FormState = {
    name: "",
    price: "",
    description: "",
    portionWeight: "",
};

/** Admin page to create, edit and delete ingredients. */
export const ManageIngredientsPage = () => {
    const navigate = useNavigate();
    const {
        data: ingredients = [],
        isLoading,
        error,
    } = useGetIngredientsQuery();
    const [saveIngredient, { isLoading: saving }] = useSaveIngredientMutation();
    const [deleteIngredient, { isLoading: deleting }] =
        useDeleteIngredientMutation();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [image, setImage] = useState<File | null>(null);
    // changing the key remounts the file input, clearing it
    const [fileKey, setFileKey] = useState(0);
    const [formError, setFormError] = useState("");

    const reset = () => {
        setSelectedId(null);
        setForm(EMPTY_FORM);
        setImage(null);
        setFileKey((key) => key + 1);
        setFormError("");
    };

    const toggleSelected = (ingredient: Ingredient) => {
        if (selectedId === ingredient.id) {
            reset();
            return;
        }
        setSelectedId(ingredient.id);
        setForm({
            name: ingredient.name,
            price: String(ingredient.price),
            description: ingredient.description,
            portionWeight: String(ingredient.portionWeight),
        });
        setImage(null);
        setFileKey((key) => key + 1);
        setFormError("");
        document
            .getElementById("form-ingredient")
            ?.scrollIntoView({ behavior: "instant", block: "center" });
    };

    const setField = (field: keyof FormState, value: string) =>
        setForm((current) => ({ ...current, [field]: value }));

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        const body = new FormData();
        body.append("name", form.name);
        body.append("price", form.price);
        body.append("description", form.description);
        body.append("portionWeight", form.portionWeight);
        if (image) body.append("image", image);
        try {
            await saveIngredient({
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
        if (!window.confirm("Deseja realmente excluir este ingrediente?")) {
            return;
        }
        try {
            await deleteIngredient(selectedId).unwrap();
            reset();
        } catch (err) {
            setFormError(errorMessage(err));
        }
    };

    return (
        <div className={styles.body}>
            <AdminNav current="ingredients" />
            <h1 style={{ textAlign: "center", margin: "30px" }}>
                Gerenciar Ingredientes 🧀
            </h1>
            <div className="container mb-2 p-1 bg-transparent">
                <div className="row section">
                    <div className="col">
                        <p>
                            <b>Ingredientes Cadastrados</b>
                        </p>
                        {isLoading && <p>Carregando...</p>}
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {errorMessage(error)}
                            </div>
                        )}
                        <div className="row section">
                            <div className="col">
                                <div className="scrollmenu">
                                    {ingredients.map((ingredient) => (
                                        <div
                                            className="ingredient"
                                            key={ingredient.id}
                                        >
                                            <img
                                                src={imageUrl(ingredient.image)}
                                                alt={ingredient.name}
                                                style={{ width: "100px" }}
                                            />
                                            <br />
                                            <p>{ingredient.name}</p>
                                            <p>
                                                {formatMoney(ingredient.price)}
                                            </p>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() =>
                                                    toggleSelected(ingredient)
                                                }
                                            >
                                                {selectedId === ingredient.id
                                                    ? "Desselecionar"
                                                    : "Selecionar"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row m-5 section">
                    <div className="card-header mb-3">
                        <h4>
                            {selectedId
                                ? "Editar Ingrediente"
                                : "Adicionar Ingrediente"}
                        </h4>
                    </div>
                    <form id="form-ingredient" onSubmit={handleSave}>
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
                                value={form.name}
                                onChange={(e) =>
                                    setField("name", e.target.value)
                                }
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label htmlFor="price">Preço</label>
                            <input
                                type="number"
                                className="form-control"
                                id="price"
                                placeholder="Preço"
                                step={0.01}
                                min={0}
                                autoComplete="off"
                                required
                                value={form.price}
                                onChange={(e) =>
                                    setField("price", e.target.value)
                                }
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label htmlFor="description">Descrição</label>
                            <input
                                type="text"
                                className="form-control"
                                id="description"
                                placeholder="Descrição"
                                autoComplete="off"
                                required
                                value={form.description}
                                onChange={(e) =>
                                    setField("description", e.target.value)
                                }
                            />
                        </div>
                        <div className="form-group mb-2">
                            <label htmlFor="portionWeight">
                                Peso Porção em gramas
                            </label>
                            <input
                                type="number"
                                step={0.01}
                                className="form-control"
                                id="portionWeight"
                                placeholder="Peso Porção"
                                min="1"
                                max="100"
                                autoComplete="off"
                                required
                                value={form.portionWeight}
                                onChange={(e) =>
                                    setField("portionWeight", e.target.value)
                                }
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
                        <button
                            type="submit"
                            className="btn btn-outline-success mb-3 mt-3"
                            disabled={saving}
                        >
                            {selectedId ? "Salvar 💿" : "Adicionar ✅"}
                        </button>
                    </form>
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={handleDeleteOrCancel}
                        disabled={deleting}
                    >
                        {selectedId ? "Deletar 🗑️" : "Cancelar ❌"}
                    </button>
                </div>
            </div>
        </div>
    );
};
