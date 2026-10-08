import { useTranslation } from "react-i18next";
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
import { signOut } from "../../features/session/sessionThunks";
import { AppNav, type NavLink } from "../ui/AppNav";

export type AdminSection =
    "home" | "ingredients" | "pizzas" | "products" | "users";

const SECTIONS: { key: AdminSection; to: string; icon: LucideIcon }[] = [
    { key: "home", to: "/admin", icon: BarChart3 },
    { key: "ingredients", to: "/admin/ingredients", icon: Carrot },
    { key: "pizzas", to: "/admin/pizzas", icon: Pizza },
    { key: "products", to: "/admin/products", icon: Wine },
    { key: "users", to: "/admin/users", icon: Users },
];

interface AdminNavProps {
    /** Section of the page currently being shown. */
    current: AdminSection;
}

/** Navigation bar of the administrator area. */
export const AdminNav = ({ current }: AdminNavProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation(["common", "admin"]);
    const title = t(`admin:nav.titles.${current}`);
    const links: NavLink[] = SECTIONS.map(({ key, ...rest }) => ({
        key,
        label: t(`admin:nav.sections.${key}`),
        ...rest,
    }));

    useEffect(() => {
        document.title = title;
    }, [title]);

    const logout = () => {
        dispatch(signOut());
        void navigate("/login");
    };

    return (
        <AppNav
            brand={t("admin:nav.brand")}
            links={links}
            current={current}
            onLogout={logout}
        />
    );
};
