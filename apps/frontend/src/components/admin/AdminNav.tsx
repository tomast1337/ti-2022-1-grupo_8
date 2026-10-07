import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppDispatch } from "../../app/hooks";
import { signedOut } from "../../features/session/sessionSlice";

export type AdminSection =
    "home" | "ingredients" | "pizzas" | "products" | "users";

const CURRENT_MARK = "🧑‍💻";

const SECTIONS: { key: AdminSection; to: string; label: string }[] = [
    { key: "home", to: "/admin", label: "Menu Administrador" },
    {
        key: "ingredients",
        to: "/admin/ingredients",
        label: "Gerir Ingredientes",
    },
    { key: "pizzas", to: "/admin/pizzas", label: "Gerir Pizzas" },
    { key: "products", to: "/admin/products", label: "Gerir Produtos" },
    { key: "users", to: "/admin/users", label: "Gerir Usuários" },
];

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
    const [expanded, setExpanded] = useState(false);
    const title = TITLES[current];

    useEffect(() => {
        document.title = title;
    }, [title]);

    const logout = () => {
        dispatch(signedOut());
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
            <span className="navbar-brand">{title}</span>
            <button
                className="navbar-toggler"
                type="button"
                onClick={() => setExpanded((value) => !value)}
            >
                <span className="navbar-toggler-icon">🔐</span>
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
                    {SECTIONS.map((section) => (
                        <Link
                            key={section.key}
                            className="btn btn-primary"
                            to={section.to}
                        >
                            {section.label}
                            {current === section.key ? (
                                <span className="badge badge-secondary">
                                    {CURRENT_MARK}
                                </span>
                            ) : null}
                        </Link>
                    ))}
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={logout}
                    >
                        Sair 👋
                    </button>
                </div>
            </div>
        </nav>
    );
};
