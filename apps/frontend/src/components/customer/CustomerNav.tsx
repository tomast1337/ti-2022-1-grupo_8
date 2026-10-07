import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { cartCleared, selectCartItems } from "../../features/cart/cartSlice";
import { signedOut } from "../../features/session/sessionSlice";

export type CustomerPage = "menu" | "build-pizza" | "cart" | "orders";

const PAGE_TITLE: Record<CustomerPage, string> = {
    menu: "Pizzaria ON - Menu",
    cart: "Pizzaria ON - Carrinho",
    "build-pizza": "Pizzaria ON - Criar Pizza",
    orders: "Pizzaria ON - Meus Pedidos",
};

const CURRENT_MARKER = "😋";

interface CustomerNavProps {
    current: CustomerPage;
}

const CurrentBadge = ({ show }: { show: boolean }) =>
    show ? (
        <span className="badge badge-secondary">{CURRENT_MARKER}</span>
    ) : null;

export const CustomerNav = ({ current }: CustomerNavProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const cartItems = useAppSelector(selectCartItems);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        document.title = PAGE_TITLE[current];
    }, [current]);

    const handleLogout = () => {
        dispatch(signedOut());
        dispatch(cartCleared());
        void navigate("/login");
    };

    const count = cartItems.length;

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
            <span
                className="navbar-brand"
                style={{ fontSize: "1.5rem", marginLeft: "1rem" }}
            >
                Pizzaria ON
            </span>
            <button
                className="navbar-toggler"
                type="button"
                onClick={() => setExpanded((value) => !value)}
            >
                <span className="navbar-toggler-icon">🍕</span>
            </button>

            <div
                className={`collapse navbar-collapse ${expanded ? "show" : ""}`}
                id="navbarNav"
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-around",
                        alignItems: "center",
                        width: "100%",
                        padding: "0 2rem 0 2rem",
                    }}
                >
                    <Link className="btn btn-primary " to="/customer/menu">
                        Menu 📑
                        <CurrentBadge show={current === "menu"} />
                    </Link>
                    <Link
                        className="btn btn-primary "
                        to="/customer/build-pizza"
                    >
                        Criar Pizza
                        <CurrentBadge show={current === "build-pizza"} />
                    </Link>
                    <Link className="btn btn-primary " to="/customer/orders">
                        Meus Pedidos
                        <CurrentBadge show={current === "orders"} />
                    </Link>
                    <Link className="btn btn-primary " to="/customer/cart">
                        Carrinho
                        <CurrentBadge show={current === "cart"} />
                        {count > 0 ? (
                            <span
                                className="badge"
                                style={{
                                    backgroundColor: "white",
                                    color: "black",
                                    marginLeft: "0.5rem",
                                }}
                            >
                                {count} {count !== 1 ? "itens" : "item"} no
                                carrinho
                            </span>
                        ) : null}
                    </Link>
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleLogout}
                    >
                        Sair 👋
                    </button>
                </div>
            </div>
        </nav>
    );
};
