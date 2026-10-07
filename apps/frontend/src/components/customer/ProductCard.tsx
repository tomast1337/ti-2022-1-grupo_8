import type { Pizza, Product } from "@pizzaria/dtos";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { itemAdded, selectCartItems } from "../../features/cart/cartSlice";
import { formatMoney } from "../../lib/format";
import { imageUrl } from "../../lib/images";

type ProductCardProps =
    { kind: "pizza"; item: Pizza } | { kind: "product"; item: Product };

export const ProductCard = ({ kind, item }: ProductCardProps) => {
    const dispatch = useAppDispatch();
    const inCart = useAppSelector(selectCartItems).some(
        (cartItem) => cartItem.id === item.id,
    );

    const handleAdd = () => {
        dispatch(
            itemAdded({
                type: kind,
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
            }),
        );
    };

    const style =
        kind === "product"
            ? { maxWidth: "540px", minWidth: "540px" }
            : { maxWidth: "540px", height: "100%" };

    return (
        <div className="col-md-6 col-lg-4 col-xl-3">
            <div className="card mt-3 mb-3" style={style}>
                <div className="row g-1">
                    <div className="col-4 col-md-12">
                        <img
                            className="card-img-top"
                            src={imageUrl(item.image)}
                            alt={item.name}
                        />
                    </div>
                    <div className="col-8 col-md-12">
                        <div className="card-body">
                            <h5 className="card-title">{item.name}</h5>
                            <p className="card-text">{item.description}</p>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <p
                                    className="card-text"
                                    style={{
                                        fontWeight: "bold",
                                        margin: "0",
                                        fontSize: "1.5rem",
                                    }}
                                >
                                    {formatMoney(item.price)}
                                </p>
                                {inCart ? (
                                    <p
                                        className="card-text"
                                        style={{
                                            color: "green",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Produto no carrinho!
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-success"
                                        onClick={handleAdd}
                                    >
                                        Adicionar ao carrinho
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
