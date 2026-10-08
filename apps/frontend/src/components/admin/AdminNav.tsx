import {
    BarChart3,
    Carrot,
    Pizza,
    Users,
    Wine,
    type LucideIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../app/hooks";
import { signedOut } from "../../features/session/sessionSlice";
import { AppNav, type NavLink } from "../ui/AppNav";

export type AdminSection =
    "home" | "ingredients" | "pizzas" | "products" | "users";

const SECTIONS: {
    key: AdminSection;
    to: string;
    label: string;
    icon: LucideIcon;
}[] = [
    { key: "home", to: "/admin", label: "Relatórios", icon: BarChart3 },
    {
        key: "ingredients",
        to: "/admin/ingredients",
        label: "Ingredientes",
        icon: Carrot,
    },
    { key: "pizzas", to: "/admin/pizzas", label: "Pizzas", icon: Pizza },
    { key: "products", to: "/admin/products", label: "Produtos", icon: Wine },
    { key: "users", to: "/admin/users", label: "Usuários", icon: Users },
];

const LINKS: NavLink[] = SECTIONS;

const TITLES: Record<AdminSection, string> = {
    home: "Pizzaria ON Admin - Menu",
    ingredients: "Pizzaria ON Admin - Ingredientes",
    pizzas: "Pizzaria ON Admin - Pizzas",
    products: "Pizzaria ON Admin - Produtos",
    users: "Pizzaria ON Admin - Gerir Usuários",
};

interface AdminNavProps {
    /** Section of the page currently being shown. */
    current: AdminSection;
}

/** Navigation bar of the administrator area. */
export const AdminNav = ({ current }: AdminNavProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const title = TITLES[current];

    useEffect(() => {
        document.title = title;
    }, [title]);

    const logout = () => {
        dispatch(signedOut());
        void navigate("/login");
    };

    return (
        <AppNav
            brand="Pizzaria ON - Admin"
            links={LINKS}
            current={current}
            onLogout={logout}
        />
    );
};
