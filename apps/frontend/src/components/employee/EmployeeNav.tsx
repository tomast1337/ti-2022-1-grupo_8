import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../app/hooks";
import { signedOut } from "../../features/session/sessionSlice";

export const EmployeeNav = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    const handleLogout = () => {
        dispatch(signedOut());
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
            <span
                className="navbar-brand"
                style={{ fontSize: "1.5rem", marginLeft: "1rem" }}
            >
                Pizzaria ON - Funcionário 💼
            </span>
            <button
                className="navbar-toggler"
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpanded((value) => !value)}
            >
                <span className="navbar-toggler-icon">🍕</span>
            </button>

            <div
                className={`collapse navbar-collapse ${expanded ? "show" : ""}`}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "right",
                        alignItems: "center",
                        width: "100%",
                        padding: "0 15% 0 2rem",
                    }}
                >
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
