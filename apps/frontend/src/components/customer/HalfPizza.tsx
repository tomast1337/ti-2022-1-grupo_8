import type { Ingredient } from "@pizzaria/dtos";
import { formatMoney } from "../../lib/format";
import { imageUrl } from "../../lib/images";

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
    const handleToggle = (id: string, checked: boolean) => {
        if (!checked) {
            onChange(selectedIds.filter((selected) => selected !== id));
        } else if (selectedIds.length < maxIngredients) {
            onChange([...selectedIds, id]);
        }
    };

    return (
        <div className="row section" style={{ marginBottom: "15px" }}>
            <div className="col">
                <p>
                    <b>Metade {index + 1}</b>
                </p>
                <div className="scrollmenu" id={`half-scroll-${index}`}>
                    {ingredients.map((ingredient) => {
                        const inputId = `half-${index}-${ingredient.id}`;
                        const checked = selectedIds.includes(ingredient.id);
                        return (
                            <div className="ingredient" key={ingredient.id}>
                                <label
                                    className="form-check-label"
                                    htmlFor={inputId}
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
                                    style={{ width: "40px", height: "40px" }}
                                    id={inputId}
                                    checked={checked}
                                    onChange={(e) =>
                                        handleToggle(
                                            ingredient.id,
                                            e.target.checked,
                                        )
                                    }
                                />
                                <p>{formatMoney(ingredient.price)}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
