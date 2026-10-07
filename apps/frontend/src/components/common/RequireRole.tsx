import type { Role } from "@pizzaria/dtos";
import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../../app/hooks";
import { selectRole } from "../../features/session/sessionSlice";

/** Where each role lands after logging in. */
export const HOME_BY_ROLE: Record<Role, string> = {
    customer: "/customer/menu",
    admin: "/admin",
    employee: "/employee/orders",
};

/** Route guard: renders child routes only for `role`, otherwise redirects. */
export const RequireRole = ({ role }: { role: Role }) => {
    const current = useAppSelector(selectRole);
    if (!current) return <Navigate to="/login" replace />;
    if (current !== role)
        return <Navigate to={HOME_BY_ROLE[current]} replace />;
    return <Outlet />;
};

export const HomeRedirect = () => {
    const role = useAppSelector(selectRole);
    return <Navigate to={role ? HOME_BY_ROLE[role] : "/login"} replace />;
};
