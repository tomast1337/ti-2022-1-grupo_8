import { BookOpen, ShoppingCart, Receipt, WandSparkles } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { cartCleared, selectCartItems } from "../../features/cart/cartSlice";
import { signOut } from "../../features/session/sessionThunks";
import { AppNav, type NavLink } from "../ui/AppNav";

export type CustomerPage = "menu" | "build-pizza" | "cart" | "orders";

const PAGE_TITLE: Record<CustomerPage, string> = {
    menu: "Pizzaria ON - Menu",
    cart: "Pizzaria ON - Carrinho",
    "build-pizza": "Pizzaria ON - Criar Pizza",
    orders: "Pizzaria ON - Meus Pedidos",
};

interface CustomerNavProps {
    current: CustomerPage;
}

export const CustomerNav = ({ current }: CustomerNavProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const count = useAppSelector(selectCartItems).length;

    useEffect(() => {
        document.title = PAGE_TITLE[current];
    }, [current]);

    const handleLogout = () => {
        dispatch(signOut());
        dispatch(cartCleared());
        void navigate("/login");
    };

    const links: NavLink[] = [
        { key: "menu", to: "/customer/menu", label: "Menu", icon: BookOpen },
        {
            key: "build-pizza",
            to: "/customer/build-pizza",
            label: "Criar Pizza",
            icon: WandSparkles,
        },
        {
            key: "orders",
            to: "/customer/orders",
            label: "Meus Pedidos",
            icon: Receipt,
        },
        {
            key: "cart",
            to: "/customer/cart",
            label: "Carrinho",
            icon: ShoppingCart,
            count,
            countLabel: `${count} ${count === 1 ? "item" : "itens"} no carrinho`,
        },
    ];

    return (
        <AppNav
            brand="Pizzaria ON"
            links={links}
            current={current}
            onLogout={handleLogout}
        />
    );
};
