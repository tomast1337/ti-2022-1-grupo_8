import { registerInputSchema } from "@pizzaria/dtos";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { errorMessage, useRegisterMutation } from "../../services/api";
import styles from "./RegisterPage.module.scss";

/** Maps the first failing field of the register schema to a pt-BR message. */
const validationMessage = (field: PropertyKey | undefined): string => {
    switch (field) {
        case "name":
            return "Preencha todos os campos";
        case "email":
            return "E-mail inválido";
        case "password":
            return "Senha deve ter no mínimo 6 caracteres";
        default:
            return "Dados inválidos";
    }
};

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [register, { isLoading }] = useRegisterMutation();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        document.title = "Pizzaria ON - Criar Usuário";
    }, []);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            setError("Preencha todos os campos");
            return;
        }
        if (password !== confirmPassword) {
            setError("Senhas não conferem");
            return;
        }
        const input = registerInputSchema.safeParse({ name, email, password });
        if (!input.success) {
            setError(validationMessage(input.error.issues[0]?.path[0]));
            return;
        }
        setError("");
        try {
            await register(input.data).unwrap();
            navigate("/login");
        } catch (err) {
            setError(errorMessage(err));
        }
    };

    return (
        <div className={styles.page}>
            <div className="logo text-center">
                <h1>Pizzaria ON</h1>
            </div>
            <div className="container mt-2 mb-5 p-5 bg-transparent">
                <div className="row mb-2">
                    <h1 className="titulo">Cadastro ✍</h1>
                </div>
                <div className="row">
                    <h5 className="text-center" style={{ color: "red" }}>
                        {error}
                    </h5>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="row mb-1">
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            placeholder="Nome"
                            autoComplete="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="row mb-1">
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="E-mail"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="row mb-1">
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Senha"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="row mb-5">
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            placeholder="Confirmar senha"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <div className="row mb-2">
                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={isLoading}
                        >
                            {isLoading ? "Cadastrando..." : "Cadastrar ✍"}
                        </button>
                    </div>
                </form>
                <div className="row mb-2">
                    <Link to="/login" className="btn btn-primary btn-block">
                        Voltar ↩
                    </Link>
                </div>
            </div>
        </div>
    );
};
