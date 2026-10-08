import { registerInputSchema } from "@pizzaria/dtos";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, PenLine } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Alert } from "../../components/ui/Alert";
import { Button, buttonClass } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Panel } from "../../components/ui/Panel";
import { errorMessage, useRegisterMutation } from "../../services/api";

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
        <div className="relative min-h-screen overflow-x-hidden bg-[#7caadb] font-sans">
            <main className="relative mx-auto w-full max-w-xl px-4 pb-16">
                <h1 className="my-8 text-center text-5xl font-extrabold tracking-wide text-white uppercase [text-shadow:1px_2px_6px_rgb(0_0_0/0.55)]">
                    Pizzaria ON
                </h1>
                <Panel className="p-8">
                    <h2 className="mb-6 flex items-center justify-center gap-2 border-b-2 border-ink pb-3 text-3xl font-extrabold text-white uppercase [text-shadow:1px_2px_6px_rgb(0_0_0/0.55)]">
                        <PenLine
                            className="size-7 text-tomato-600"
                            aria-hidden
                        />
                        Cadastro
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {error && <Alert>{error}</Alert>}
                        <Input
                            type="text"
                            name="name"
                            placeholder="Nome"
                            autoComplete="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            type="email"
                            name="email"
                            placeholder="E-mail"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            type="password"
                            name="password"
                            placeholder="Senha"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirmar senha"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button type="submit" block disabled={isLoading}>
                            {isLoading ? "Cadastrando..." : "Cadastrar"}
                        </Button>
                    </form>
                    <Link
                        to="/login"
                        className={`${buttonClass({ variant: "ghost", block: true })} mt-6`}
                    >
                        <ArrowLeft className="size-5" aria-hidden />
                        Voltar
                    </Link>
                </Panel>
            </main>
        </div>
    );
};
