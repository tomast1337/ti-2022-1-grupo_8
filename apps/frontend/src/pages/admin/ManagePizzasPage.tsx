import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import type { Pizza } from "@pizzaria/dtos";
import { Check, Pizza as PizzaIcon } from "lucide-react";
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
import { cn } from "../../components/ui/cn";
import {
    errorMessage,
    useDeletePizzaMutation,
    useGetIngredientsQuery,
    useGetPizzasQuery,
    useSavePizzaMutation,
} from "../../services/api";
import { formatMoney } from "../../lib/format";
import { imageUrl } from "../../lib/images";

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
        <AdminPage>
            <AdminNav current="pizzas" />
            <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-16">
                <PageTitle>
                    <PizzaIcon className="size-9" aria-hidden />
                    Gerenciar Pizzas
                </PageTitle>
                {(error || ingredientsError) && (
                    <Alert>{errorMessage(error ?? ingredientsError)}</Alert>
                )}
                <Panel className="space-y-3">
                    <h2 className="m-0 font-sans text-2xl font-extrabold tracking-normal text-ink normal-case [text-shadow:none]">
                        Pizzas Cadastradas
                    </h2>
                    {isLoading && <p>Carregando...</p>}
                    <CatalogRow>
                        {pizzas.map((pizza) => (
                            <CatalogCard
                                key={pizza.id}
                                name={pizza.name}
                                image={pizza.image}
                                price={pizza.price}
                                selected={selectedId === pizza.id}
                                onToggle={() => toggleSelected(pizza)}
                            />
                        ))}
                    </CatalogRow>
                </Panel>
                <Panel>
                    <form
                        id="form-pizza"
                        onSubmit={handleSave}
                        className="space-y-4"
                    >
                        <h2 className="m-0 font-sans text-2xl font-extrabold tracking-normal text-ink normal-case [text-shadow:none]">
                            {selectedId ? "Editar Pizza" : "Adicionar Pizza"}
                        </h2>
                        {formError && <Alert>{formError}</Alert>}
                        <Field label="Nome" htmlFor="name">
                            <Input
                                type="text"
                                id="name"
                                placeholder="Nome"
                                autoComplete="off"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Field>
                        <Field label="Descrição" htmlFor="description">
                            <Textarea
                                id="description"
                                placeholder="Descrição"
                                autoComplete="off"
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Field>
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
                        <fieldset className="m-0 min-w-0 border-0 p-0">
                            <legend className="mb-2 p-0 text-base font-extrabold text-ink">
                                Ingredientes
                            </legend>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                {ingredients.map((ingredient) => {
                                    const checked = ingredientIds.includes(
                                        ingredient.id,
                                    );
                                    return (
                                        <div
                                            key={ingredient.id}
                                            data-slot="ingredient"
                                            className="relative"
                                        >
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                id={`ingredient-${ingredient.id}`}
                                                checked={checked}
                                                onChange={(e) =>
                                                    toggleIngredient(
                                                        ingredient.id,
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={`ingredient-${ingredient.id}`}
                                                className={cn(
                                                    "flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-transparent bg-white p-2 text-center shadow-sm transition",
                                                    "peer-focus-visible:outline-2 peer-focus-visible:outline-tomato-600",
                                                    checked &&
                                                        "border-basil-600 bg-basil-500/15",
                                                )}
                                            >
                                                <img
                                                    src={imageUrl(
                                                        ingredient.image,
                                                    )}
                                                    alt=""
                                                    loading="lazy"
                                                    className="aspect-square w-full rounded-lg bg-cheese-400/20 object-cover"
                                                />
                                                <span className="text-sm leading-tight font-bold text-ink">
                                                    {ingredient.name}
                                                </span>
                                                <span className="text-xs font-semibold text-ink/60">
                                                    {formatMoney(
                                                        ingredient.price,
                                                    )}
                                                </span>
                                            </label>
                                            {checked ? (
                                                <span className="pointer-events-none absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-basil-600 text-white">
                                                    <Check
                                                        className="size-4"
                                                        aria-hidden
                                                    />
                                                </span>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </fieldset>
                        <p className="m-0 text-right text-lg text-ink/70">
                            Preço total:{" "}
                            <strong
                                data-slot="price"
                                className="text-3xl text-ink"
                            >
                                {formatMoney(price)}
                            </strong>
                        </p>
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
