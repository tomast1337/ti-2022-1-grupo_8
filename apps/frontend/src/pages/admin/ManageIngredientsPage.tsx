import { useTranslation } from "react-i18next";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import type { Ingredient } from "@pizzaria/dtos";
import { Carrot } from "lucide-react";
import { AdminNav } from "../../components/admin/AdminNav";
import { AdminPage } from "../../components/admin/AdminPage";
import { CatalogCard, CatalogRow } from "../../components/admin/CatalogCard";
import { FormActions } from "../../components/admin/FormActions";
import { Alert } from "../../components/ui/Alert";
import { Field, FILE_INPUT_CLASS } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { PageTitle } from "../../components/ui/PageTitle";
import { Panel } from "../../components/ui/Panel";
import {
    errorMessage,
    useDeleteIngredientMutation,
    useGetIngredientsQuery,
    useSaveIngredientMutation,
} from "../../services/api";

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
    const { t } = useTranslation("admin");
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
        if (!window.confirm(t("ingredients.confirmDelete"))) {
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
        <AdminPage>
            <AdminNav current="ingredients" />
            <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-16">
                <PageTitle>
                    <Carrot className="size-9" aria-hidden />
                    {t("ingredients.title")}
                </PageTitle>
                <Panel className="space-y-3">
                    <h2 className="m-0 font-sans text-2xl font-extrabold tracking-normal text-ink normal-case [text-shadow:none]">
                        {t("ingredients.registered")}
                    </h2>
                    {isLoading && <p>{t("loading")}</p>}
                    {error && <Alert>{errorMessage(error)}</Alert>}
                    <CatalogRow>
                        {ingredients.map((ingredient) => (
                            <CatalogCard
                                key={ingredient.id}
                                name={ingredient.name}
                                image={ingredient.image}
                                price={ingredient.price}
                                selected={selectedId === ingredient.id}
                                onToggle={() => toggleSelected(ingredient)}
                            />
                        ))}
                    </CatalogRow>
                </Panel>
                <Panel>
                    <form
                        id="form-ingredient"
                        onSubmit={handleSave}
                        className="space-y-4"
                    >
                        <h2 className="m-0 font-sans text-2xl font-extrabold tracking-normal text-ink normal-case [text-shadow:none]">
                            {selectedId
                                ? t("ingredients.edit")
                                : t("ingredients.new")}
                        </h2>
                        {formError && <Alert>{formError}</Alert>}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label={t("fields.name")} htmlFor="name">
                                <Input
                                    type="text"
                                    id="name"
                                    placeholder="Nome"
                                    autoComplete="off"
                                    required
                                    value={form.name}
                                    onChange={(e) =>
                                        setField("name", e.target.value)
                                    }
                                />
                            </Field>
                            <Field label={t("fields.price")} htmlFor="price">
                                <Input
                                    type="number"
                                    id="price"
                                    placeholder={t("fields.price")}
                                    step={0.01}
                                    min={0}
                                    autoComplete="off"
                                    required
                                    value={form.price}
                                    onChange={(e) =>
                                        setField("price", e.target.value)
                                    }
                                />
                            </Field>
                            <Field
                                label={t("fields.description")}
                                htmlFor="description"
                            >
                                <Input
                                    type="text"
                                    id="description"
                                    placeholder={t("fields.description")}
                                    autoComplete="off"
                                    required
                                    value={form.description}
                                    onChange={(e) =>
                                        setField("description", e.target.value)
                                    }
                                />
                            </Field>
                            <Field
                                label={t("fields.portionWeight")}
                                htmlFor="portionWeight"
                            >
                                <Input
                                    type="number"
                                    step={0.01}
                                    id="portionWeight"
                                    placeholder={t("fields.portionWeightShort")}
                                    min="1"
                                    max="100"
                                    autoComplete="off"
                                    required
                                    value={form.portionWeight}
                                    onChange={(e) =>
                                        setField(
                                            "portionWeight",
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </div>
                        <Field label={t("fields.image")} htmlFor="image">
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
