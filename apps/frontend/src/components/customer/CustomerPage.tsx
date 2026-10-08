import type { ReactNode } from "react";
import backgroundUrl from "../../assets/customer-background.jpg";
import { cn } from "../ui/cn";

/** Page frame for the customer area: pizza-table photo behind a light veil. */
export const CustomerPage = ({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) => (
    <div
        className={cn(
            "min-h-screen bg-cover bg-fixed bg-no-repeat font-sans",
            className,
        )}
        style={{
            backgroundImage: `linear-gradient(rgb(255 255 255 / 0.5), rgb(255 255 255 / 0.5)), url(${backgroundUrl})`,
        }}
    >
        {children}
    </div>
);
