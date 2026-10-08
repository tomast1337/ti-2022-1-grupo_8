import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { LanguageSwitcher } from "../../components/ui/LanguageSwitcher";
import { registerInputSchema } from "@pizzaria/dtos";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, PenLine } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Alert } from "../../components/ui/Alert";
import { Button, buttonClass } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Panel } from "../../components/ui/Panel";
import { errorMessage, useRegisterMutation } from "../../services/api";

/** Maps the first failing field of the register schema to a message. */
const validationMessage = (
    field: PropertyKey | undefined,
    t: TFunction<"auth">,
): string => {
    switch (field) {
        case "name":
            return t("register.fillAll");
        case "email":
            return t("register.invalidEmail");
        case "password":
            return t("register.invalidPassword");
        default:
            return t("register.invalidData");
    }
};

export const RegisterPage = () => {
    const { t } = useTranslation(["auth", "common"]);
    const navigate = useNavigate();
    const [register, { isLoading }] = useRegisterMutation();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        document.title = t("register.pageTitle");
    }, [t]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            setError(t("register.fillAll"));
            return;
        }
        if (password !== confirmPassword) {
            setError(t("register.mismatch"));
            return;
        }
        const input = registerInputSchema.safeParse({ name, email, password });
        if (!input.success) {
            setError(validationMessage(input.error.issues[0]?.path[0], t));
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
                <LanguageSwitcher className="absolute top-4 right-4 rounded-xl bg-white/80 px-2 py-1" />
                <h1 className="my-8 text-center text-5xl font-extrabold tracking-wide text-white uppercase [text-shadow:1px_2px_6px_rgb(0_0_0/0.55)]">
                    {t("common:brand")}
                </h1>
                <Panel className="p-8">
                    <h2 className="mb-6 flex items-center justify-center gap-2 border-b-2 border-ink pb-3 text-3xl font-extrabold text-white uppercase [text-shadow:1px_2px_6px_rgb(0_0_0/0.55)]">
                        <PenLine
                            className="size-7 text-tomato-600"
                            aria-hidden
                        />
                        {t("register.title")}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {error && <Alert>{error}</Alert>}
                        <Input
                            type="text"
                            name="name"
                            placeholder={t("fields.name")}
                            autoComplete="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            type="email"
                            name="email"
                            placeholder={t("fields.email")}
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            type="password"
                            name="password"
                            placeholder={t("fields.password")}
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Input
                            type="password"
                            name="confirmPassword"
                            placeholder={t("fields.confirmPassword")}
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button type="submit" block disabled={isLoading}>
                            {isLoading
                                ? t("register.submitting")
                                : t("register.submit")}
                        </Button>
                    </form>
                    <Link
                        to="/login"
                        className={`${buttonClass({ variant: "ghost", block: true })} mt-6`}
                    >
                        <ArrowLeft className="size-5" aria-hidden />
                        {t("common:back")}
                    </Link>
                </Panel>
            </main>
        </div>
    );
};
