import { Home } from "lucide-react";
import { Link } from "react-router";
import backgroundUrl from "../../assets/customer-background.jpg";
import { buttonClass } from "../ui/Button";

export const NotFound = () => (
    <div
        className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cover bg-center px-4 text-center font-sans"
        style={{
            backgroundImage: `linear-gradient(rgb(0 0 0 / 0.35), rgb(0 0 0 / 0.35)), url(${backgroundUrl})`,
        }}
    >
        <h1 className="m-0 text-4xl font-extrabold tracking-wide text-white uppercase [text-shadow:1px_2px_6px_rgb(0_0_0/0.65)] sm:text-6xl">
            Nem uma pizza por aqui!
        </h1>
        <Link to="/login" className={buttonClass({ variant: "accent" })}>
            <Home className="size-5" aria-hidden />
            Voltar para o início
        </Link>
    </div>
);
