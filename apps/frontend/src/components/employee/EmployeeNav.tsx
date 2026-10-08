import { ClipboardList } from "lucide-react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../app/hooks";
import { signOut } from "../../features/session/sessionThunks";
import { AppNav, type NavLink } from "../ui/AppNav";

const LINKS: NavLink[] = [
    {
        key: "orders",
        to: "/employee/orders",
        label: "Pedidos",
        icon: ClipboardList,
    },
];

export const EmployeeNav = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(signOut());
        void navigate("/login");
    };

    return (
        <AppNav
            brand="Pizzaria ON - Funcionário"
            links={LINKS}
            current="orders"
            onLogout={handleLogout}
        />
    );
};
