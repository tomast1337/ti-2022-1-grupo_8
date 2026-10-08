import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import type { Product } from "@pizzaria/dtos";
import { Wine } from "lucide-react";
import { AdminNav } from "../../components/admin/AdminNav";
import { AdminPage } from "../../components/admin/AdminPage";
import { CatalogCard, CatalogRow } from "../../components/admin/CatalogCard";
import { FormActions } from "../../components/admin/FormActions";
import { Alert } from "../../components/ui/Alert";
import { Field, FILE_INPUT_CLASS } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { PageTitle } from "../../components/ui/PageTitle";
import { Panel } from "../../components/ui/Panel";
import { Textarea } from "../../components/ui/Textarea";
import {
    errorMessage,
    useDeleteProductMutation,
    useGetProductsQuery,
    useSaveProductMutation,
} from "../../services/api";

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
        <AdminPage>
            <AdminNav current="products" />
            <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-16">
                <PageTitle>
                    <Wine className="size-9" aria-hidden />
                    Gerenciar Produtos
                </PageTitle>
                <Panel className="space-y-3">
                    <h2 className="m-0 font-sans text-2xl font-extrabold tracking-normal text-ink normal-case [text-shadow:none]">
                        Produtos Cadastrados
                    </h2>
                    {isLoading && <p>Carregando...</p>}
                    {error && <Alert>{errorMessage(error)}</Alert>}
                    <CatalogRow>
                        {products.map((product) => (
                            <CatalogCard
                                key={product.id}
                                name={product.name}
                                image={product.image}
                                price={product.price}
                                selected={selectedId === product.id}
                                onToggle={() => toggleSelected(product)}
                            />
                        ))}
                    </CatalogRow>
                </Panel>
                <Panel>
                    <form
                        id="form-product"
                        onSubmit={handleSave}
                        className="space-y-4"
                    >
                        <h2 className="m-0 font-sans text-2xl font-extrabold tracking-normal text-ink normal-case [text-shadow:none]">
                            {selectedId
                                ? "Editar Produto"
                                : "Adicionar Novo Produto"}
                        </h2>
                        {formError && <Alert>{formError}</Alert>}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Nome" htmlFor="name">
                                <Input
                                    type="text"
                                    id="name"
                                    required
                                    value={form.name}
                                    onChange={(e) =>
                                        setField("name", e.target.value)
                                    }
                                />
                            </Field>
                            <Field label="Preço" htmlFor="price">
                                <Input
                                    type="number"
                                    step={0.01}
                                    min={0}
                                    id="price"
                                    required
                                    value={form.price}
                                    onChange={(e) =>
                                        setField("price", e.target.value)
                                    }
                                />
                            </Field>
                        </div>
                        <Field label="Imagem" htmlFor="image">
                            <Input
                                key={fileKey}
                                type="file"
                                accept="image/*"
                                id="image"
                                className={FILE_INPUT_CLASS}
                                required={!selectedId}
                                onChange={(e) =>
                                    setImage(e.target.files?.[0] ?? null)
                                }
                            />
                        </Field>
                        <Field label="Descrição" htmlFor="description">
                            <Textarea
                                id="description"
                                required
                                value={form.description}
                                onChange={(e) =>
                                    setField("description", e.target.value)
                                }
                            />
                        </Field>
                        <FormActions
                            editing={Boolean(selectedId)}
                            saving={saving}
                            deleting={deleting}
                            onDeleteOrCancel={() => void handleDeleteOrCancel()}
                        />
                    </form>
                </Panel>
            </main>
        </AdminPage>
    );
};
