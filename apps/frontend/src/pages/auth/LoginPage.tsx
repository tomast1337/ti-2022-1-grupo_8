import { loginInputSchema } from "@pizzaria/dtos";
import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { HOME_BY_ROLE } from "../../components/common/RequireRole";
import { selectRole, signedIn } from "../../features/session/sessionSlice";
import { errorMessage, useLoginMutation } from "../../services/api";
import { imageUrl } from "../../lib/images";
import styles from "./LoginPage.module.scss";

export const LoginPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const role = useAppSelector(selectRole);
    const [login, { isLoading }] = useLoginMutation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        document.title = "Pizzaria ON - Login";
    }, []);

    if (role) return <Navigate to={HOME_BY_ROLE[role]} replace />;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const input = loginInputSchema.safeParse({ email, password });
        if (!input.success) {
            setError("E-mail ou senha inválidos");
            return;
        }
        setError("");
        try {
            const response = await login(input.data).unwrap();
            dispatch(signedIn(response));
            navigate(HOME_BY_ROLE[response.user.role]);
        } catch (err) {
            setError(errorMessage(err));
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.logo}>
                <h1>Pizzaria ON</h1>
            </div>

            <div className="container mt-1 mb-5 p-5 section">
                <div className="row">
                    <h1 className="title">Login</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="row mb-2">
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="form-control"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="row mb-2">
                        <input
                            type="password"
                            name="password"
                            placeholder="Senha"
                            className="form-control"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="row mb-5">
                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={isLoading}
                        >
                            {isLoading ? "Entrando..." : "Logar"}
                        </button>
                    </div>
                </form>
                <div className="row mb-2">
                    <p>Não possui conta? Cadastre-se</p>
                    <Link to="/register" className="btn btn-warning btn-block">
                        Criar conta
                    </Link>
                </div>
            </div>
            <img
                src={imageUrl("/imgs/parallax1.png")}
                alt="Pizzaria ON"
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    zIndex: -1,
                }}
            />
        </div>
    );
};
