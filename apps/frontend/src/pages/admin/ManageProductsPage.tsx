import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import type { Product } from "@pizzaria/dtos";
import { AdminNav } from "../../components/admin/AdminNav";
import {
    errorMessage,
    useDeleteProductMutation,
    useGetProductsQuery,
    useSaveProductMutation,
} from "../../services/api";
import { imageUrl } from "../../lib/images";
import styles from "./ManageProductsPage.module.scss";

interface FormState {
    name: string;
    price: string;
    description: string;
}

const EMPTY_FORM: FormState = { name: "", price: "", description: "" };

/** Admin page to create, edit and delete products (drinks, desserts). */
export const ManageProductsPage = () => {
    const navigate = useNavigate();
    const { data: products = [], isLoading, error } = useGetProductsQuery();
    const [saveProduct, { isLoading: saving }] = useSaveProductMutation();
    const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

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

    const toggleSelected = (product: Product) => {
        if (selectedId === product.id) {
            reset();
            return;
        }
        setSelectedId(product.id);
        setForm({
            name: product.name,
            price: String(product.price),
            description: product.description,
        });
        setImage(null);
        setFileKey((key) => key + 1);
        setFormError("");
    };

    const setField = (field: keyof FormState, value: string) =>
        setForm((current) => ({ ...current, [field]: value }));

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        const body = new FormData();
        body.append("name", form.name);
        body.append("price", form.price);
        body.append("description", form.description);
        if (image) body.append("image", image);
        try {
            await saveProduct({
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
        if (!window.confirm("Deseja realmente excluir este produto?")) return;
        try {
            await deleteProduct(selectedId).unwrap();
            reset();
        } catch (err) {
            setFormError(errorMessage(err));
        }
    };

    return (
        <div className={styles.body}>
            <AdminNav current="products" />
            <div className="container mb-2 p-1 bg-transparent">
                <div className="row">
                    <h1 style={{ textAlign: "center", margin: "30px" }}>
                        Gerenciar Produtos 🍾
                    </h1>
                    <div className="row section mb-3">
                        <h4> Adicionar Novo ou Editar Produto </h4>
                    </div>
                    <h3>
                        <b> Produtos Cadastrados 🍾</b>
                    </h3>
                </div>
                <div className="row section mb-1">
                    {isLoading && <p>Carregando...</p>}
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {errorMessage(error)}
                        </div>
                    )}
                    <div className="scrollmenu">
                        {products.map((product) => (
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
                                key={product.id}
                            >
                                <img
                                    className="card-img-top"
                                    src={imageUrl(product.image)}
                                    alt={product.name}
                                    style={{
                                        width: "12rem",
                                        height: "12rem",
                                        objectFit: "cover",
                                    }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {product.name}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn btn-lg btn-primary btn-success"
                                        onClick={() => toggleSelected(product)}
                                    >
                                        {selectedId === product.id
                                            ? "Desselecionar"
                                            : "Selecionar"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="row section">
                    <form onSubmit={handleSave}>
                        {formError && (
                            <div className="row">
                                <h5
                                    className="text-center"
                                    style={{
                                        color: "red",
                                        textShadow: "0px 0px 10px black",
                                    }}
                                >
                                    {formError}
                                </h5>
                            </div>
                        )}

                        <div className="col-md-6">
                            <label htmlFor="name">Nome</label>
                            <input
                                type="text"
                                className="form-control"
                                id="name"
                                required
                                value={form.name}
                                onChange={(e) =>
                                    setField("name", e.target.value)
                                }
                            />

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

                            <label htmlFor="price">Preço</label>
                            <input
                                type="number"
                                step={0.01}
                                min={0}
                                className="form-control"
                                id="price"
                                required
                                value={form.price}
                                onChange={(e) =>
                                    setField("price", e.target.value)
                                }
                            />

                            <label htmlFor="description">Descrição</label>
                            <textarea
                                className="form-control"
                                id="description"
                                required
                                value={form.description}
                                onChange={(e) =>
                                    setField("description", e.target.value)
                                }
                            />
                        </div>

                        <div style={{ textAlign: "center", marginTop: "2rem" }}>
                            <button
                                type="submit"
                                className="btn btn-outline-success btn-lg"
                                disabled={saving}
                            >
                                {selectedId ? "Salvar 💿" : "Adicionar ✅"}
                            </button>
                            <button
                                type="button"
                                style={{ margin: " 0 5px" }}
                                className="btn btn-outline-danger btn-lg"
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
