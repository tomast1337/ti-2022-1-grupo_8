import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { CustomerNav } from "../../components/customer/CustomerNav";
import {
    addressChanged,
    cartCleared,
    itemRemoved,
    quantityChanged,
    selectAddress,
    selectCartItems,
    selectCartTotal,
} from "../../features/cart/cartSlice";
import { formatMoney } from "../../lib/format";
import { errorMessage, usePlaceOrderMutation } from "../../services/api";
import styles from "./CartPage.module.scss";

const centered = { textAlign: "center", width: "25%" } as const;

export const CartPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const items = useAppSelector(selectCartItems);
    const total = useAppSelector(selectCartTotal);
    const address = useAppSelector(selectAddress);
    const [placeOrder, { isLoading, error }] = usePlaceOrderMutation();

    const handleCheckout = async () => {
        if (items.length === 0 || address.trim() === "") return;
        try {
            await placeOrder({ address, items }).unwrap();
        } catch {
            return; // the error is shown from the mutation state
        }
        dispatch(cartCleared());
        void navigate("/customer/orders");
    };

    return (
        <div className={styles.body}>
            <CustomerNav current="cart" />
            <div className="container mt-5 mb-2 p-5">
                <div className="row">
                    <h1 className="text-center">Carrinho 🛒</h1>
                </div>

                {items.length === 0 ? (
                    <div className="row section">
                        <div
                            className="col-12 text-center"
                            style={{ marginBottom: "30px" }}
                        >
                            <h2>Carrinho vazio!</h2>
                            <p>
                                Por que não dá uma olhadinha nos nossos
                                produtos? 👀😋
                            </p>
                            <Link
                                to="/customer/menu"
                                className="btn btn-primary"
                            >
                                Voltar para o menu
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="row">
                            <div className="col-md-12">
                                <table className="table table-striped table-dark">
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th style={{ textAlign: "center" }}>
                                                Preço
                                            </th>
                                            <th style={{ textAlign: "center" }}>
                                                Quantidade
                                            </th>
                                            <th style={{ textAlign: "center" }}>
                                                Subtotal
                                            </th>
                                            <th>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="table-hover">
                                        {items.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.name}</td>
                                                <td style={centered}>
                                                    {formatMoney(item.price)}
                                                </td>
                                                <td style={centered}>
                                                    <div className="quantity-selector">
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                dispatch(
                                                                    quantityChanged(
                                                                        {
                                                                            id: item.id,
                                                                            quantity:
                                                                                item.quantity -
                                                                                1,
                                                                        },
                                                                    ),
                                                                )
                                                            }
                                                            disabled={
                                                                item.quantity ===
                                                                1
                                                            }
                                                        >
                                                            -
                                                        </button>
                                                        {item.quantity}
                                                        <button
                                                            type="button"
                                                            className="btn btn-success btn-sm"
                                                            onClick={() =>
                                                                dispatch(
                                                                    quantityChanged(
                                                                        {
                                                                            id: item.id,
                                                                            quantity:
                                                                                item.quantity +
                                                                                1,
                                                                        },
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td style={centered}>
                                                    {formatMoney(
                                                        item.price *
                                                            item.quantity,
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                            dispatch(
                                                                itemRemoved(
                                                                    item.id,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        Remover
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="row">
                            <div
                                className="col-md-12"
                                style={{
                                    textAlign: "right",
                                    marginBottom: "20px",
                                }}
                            >
                                <h3>
                                    Total:{" "}
                                    <span className="cart-total">
                                        {formatMoney(total)}
                                    </span>
                                </h3>
                            </div>
                        </div>

                        <div
                            className="row section"
                            style={{
                                marginBottom: "20px",
                                flexDirection: "row",
                            }}
                        >
                            <div className="col-md-12">
                                <strong>Endereço de entrega</strong>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Endereço"
                                    value={address}
                                    onChange={(e) =>
                                        dispatch(addressChanged(e.target.value))
                                    }
                                />
                            </div>
                        </div>

                        {error ? (
                            <p className="text-danger text-center">
                                {errorMessage(error)}
                            </p>
                        ) : null}

                        <div
                            className="row section"
                            style={{
                                marginBottom: "20px",
                                flexDirection: "row",
                            }}
                        >
                            <Link
                                to="/customer/menu"
                                className="btn btn-warning"
                            >
                                Voltar
                            </Link>
                            <button
                                type="button"
                                className="btn btn-danger mt-2"
                                onClick={() => dispatch(cartCleared())}
                                disabled={isLoading}
                            >
                                Limpar Carrinho
                            </button>
                            <button
                                type="button"
                                className="btn btn-success mt-2"
                                onClick={() => void handleCheckout()}
                                disabled={isLoading || address.trim() === ""}
                            >
                                Finalizar Compra
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
