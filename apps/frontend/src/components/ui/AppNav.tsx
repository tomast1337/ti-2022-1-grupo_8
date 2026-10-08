import { LogOut, Menu, Pizza, X, type LucideIcon } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Link } from "react-router";
import { cn } from "./cn";

export interface NavLink {
    key: string;
    to: string;
    label: string;
    icon: LucideIcon;
    /** Small counter shown next to the label, hidden when 0. */
    count?: number;
    countLabel?: string;
}

interface AppNavProps {
    brand: string;
    links: NavLink[];
    current: string;
    onLogout: () => void;
}

/** Top bar for every role: inline links on desktop, a burger menu on mobile. */
export const AppNav = ({ brand, links, current, onLogout }: AppNavProps) => {
    const [open, setOpen] = useState(false);
    const menuId = useId();

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    return (
        <header className="sticky top-0 z-50 border-b border-ink/10 bg-white/90 font-sans shadow-sm backdrop-blur-md">
            <nav
                aria-label="Navegação principal"
                className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 px-4 py-2"
            >
                <span className="flex items-center gap-2 text-xl font-extrabold text-ink">
                    <Pizza className="size-6 text-tomato-600" aria-hidden />
                    {brand}
                </span>

                <button
                    type="button"
                    aria-label={open ? "Fechar menu" : "Abrir menu"}
                    aria-expanded={open}
                    aria-controls={menuId}
                    onClick={() => setOpen((value) => !value)}
                    className="ml-auto inline-flex size-11 cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent text-ink transition hover:bg-ink/5 md:hidden"
                >
                    {open ? (
                        <X className="size-6" aria-hidden />
                    ) : (
                        <Menu className="size-6" aria-hidden />
                    )}
                </button>

                <ul
                    id={menuId}
                    className={cn(
                        "m-0 w-full list-none flex-col gap-1 p-0 pt-2 pb-2",
                        "md:ml-auto md:flex md:w-auto md:flex-row md:items-center md:gap-1 md:pt-0 md:pb-0",
                        open ? "flex" : "hidden",
                    )}
                >
                    {links.map(
                        ({ key, to, label, icon: Icon, count, countLabel }) => {
                            const active = key === current;
                            return (
                                <li key={key}>
                                    <Link
                                        to={to}
                                        aria-current={
                                            active ? "page" : undefined
                                        }
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-bold no-underline transition",
                                            active
                                                ? "bg-tomato-600 text-white shadow-sm"
                                                : "text-ink hover:bg-ink/5",
                                        )}
                                    >
                                        <Icon className="size-5" aria-hidden />
                                        {label}
                                        {count ? (
                                            <span
                                                aria-label={countLabel}
                                                className={cn(
                                                    "ml-auto inline-flex min-w-6 items-center justify-center rounded-full px-1.5 text-sm leading-6 font-extrabold md:ml-1",
                                                    active
                                                        ? "bg-white text-tomato-700"
                                                        : "bg-cheese-500 text-ink",
                                                )}
                                            >
                                                {count}
                                            </span>
                                        ) : null}
                                    </Link>
                                </li>
                            );
                        },
                    )}
                    <li className="mt-1 border-t border-ink/10 pt-2 md:mt-0 md:ml-2 md:border-t-0 md:pt-0">
                        <button
                            type="button"
                            onClick={onLogout}
                            className="flex w-full cursor-pointer items-center gap-2 rounded-xl border-0 bg-transparent px-4 py-2.5 text-base font-bold text-tomato-700 transition hover:bg-tomato-50"
                        >
                            <LogOut className="size-5" aria-hidden />
                            Sair
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    );
};
