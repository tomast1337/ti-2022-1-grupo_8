import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../app/hooks";
import { signOut } from "../../features/session/sessionThunks";
import { AppNav, type NavLink } from "../ui/AppNav";

export const EmployeeNav = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation(["common", "employee"]);
    const links: NavLink[] = [
        {
            key: "orders",
            to: "/employee/orders",
            label: t("employee:nav.orders"),
            icon: ClipboardList,
        },
    ];

    const handleLogout = () => {
        dispatch(signOut());
        void navigate("/login");
    };

    return (
        <AppNav
            brand={t("employee:nav.brand")}
            links={links}
            current="orders"
            onLogout={handleLogout}
        />
    );
};
