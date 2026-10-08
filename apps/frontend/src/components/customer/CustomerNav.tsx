import { useTranslation } from "react-i18next";
import { BookOpen, ShoppingCart, Receipt, WandSparkles } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { cartCleared, selectCartItems } from "../../features/cart/cartSlice";
import { signOut } from "../../features/session/sessionThunks";
import { AppNav, type NavLink } from "../ui/AppNav";

export type CustomerPage = "menu" | "build-pizza" | "cart" | "orders";

interface CustomerNavProps {
    current: CustomerPage;
}

export const CustomerNav = ({ current }: CustomerNavProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation(["common", "customer"]);
    const count = useAppSelector(selectCartItems).length;

    useEffect(() => {
        document.title = t(`customer:nav.titles.${current}`);
    }, [current, t]);

    const handleLogout = () => {
        dispatch(signOut());
        dispatch(cartCleared());
        void navigate("/login");
    };

    const links: NavLink[] = [
        {
            key: "menu",
            to: "/customer/menu",
            label: t("customer:nav.menu"),
            icon: BookOpen,
        },
        {
            key: "build-pizza",
            to: "/customer/build-pizza",
            label: t("customer:nav.buildPizza"),
            icon: WandSparkles,
        },
        {
            key: "orders",
            to: "/customer/orders",
            label: t("customer:nav.orders"),
            icon: Receipt,
        },
        {
            key: "cart",
            to: "/customer/cart",
            label: t("customer:nav.cart"),
            icon: ShoppingCart,
            count,
            countLabel: t("customer:nav.cartCount", { count }),
        },
    ];

    return (
        <AppNav
            brand={t("brand")}
            links={links}
            current={current}
            onLogout={handleLogout}
        />
    );
};
