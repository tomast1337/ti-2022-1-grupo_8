import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/ui/LanguageSwitcher";
import { loginInputSchema } from "@pizzaria/dtos";
import { useEffect, useState, type FormEvent } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Alert } from "../../components/ui/Alert";
import { Button, buttonClass } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Panel } from "../../components/ui/Panel";
import { HOME_BY_ROLE } from "../../components/common/RequireRole";
import { selectRole, signedIn } from "../../features/session/sessionSlice";
import { errorMessage, useLoginMutation } from "../../services/api";
import { imageUrl } from "../../lib/images";

export const LoginPage = () => {
    const { t } = useTranslation(["auth", "common"]);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const role = useAppSelector(selectRole);
    const [login, { isLoading }] = useLoginMutation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        document.title = t("login.pageTitle");
    }, [t]);

    if (role) return <Navigate to={HOME_BY_ROLE[role]} replace />;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const input = loginInputSchema.safeParse({ email, password });
        if (!input.success) {
            setError(t("login.invalid"));
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
        <div className="relative min-h-screen overflow-x-hidden bg-[#7caadb] font-sans">
            <img
                src={imageUrl("/imgs/parallax1.png")}
                alt=""
                className="pointer-events-none fixed inset-x-0 bottom-0 -z-0 w-full"
            />
            <main className="relative mx-auto w-full max-w-xl px-4 pb-16">
                <LanguageSwitcher className="absolute top-4 right-4 rounded-xl bg-white/80 px-2 py-1" />
                <h1 className="my-8 text-center text-5xl font-extrabold tracking-wide text-white uppercase [text-shadow:1px_2px_6px_rgb(0_0_0/0.55)]">
                    {t("common:brand")}
                </h1>
                <Panel className="p-8">
                    <h2 className="mb-6 flex items-center justify-center gap-2 border-b-2 border-ink pb-3 text-3xl font-extrabold text-white uppercase [text-shadow:1px_2px_6px_rgb(0_0_0/0.55)]">
                        <LogIn
                            className="size-7 text-tomato-600 drop-shadow-none"
                            aria-hidden
                        />
                        {t("login.title")}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {error && <Alert>{error}</Alert>}
                        <Input
                            id="email"
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
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button type="submit" block disabled={isLoading}>
                            {isLoading
                                ? t("login.submitting")
                                : t("login.submit")}
                        </Button>
                    </form>
                    <div className="mt-8 space-y-3">
                        <p className="font-semibold text-ink">
                            {t("login.noAccount")}
                        </p>
                        <Link
                            to="/register"
                            className={buttonClass({
                                variant: "accent",
                                block: true,
                            })}
                        >
                            <UserPlus className="size-5" aria-hidden />
                            {t("login.createAccount")}
                        </Link>
                    </div>
                </Panel>
            </main>
        </div>
    );
};
