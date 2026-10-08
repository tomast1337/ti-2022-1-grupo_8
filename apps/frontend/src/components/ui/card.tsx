import type { ComponentProps } from "react";
import { cn } from "./cn";

/* shadcn/ui Card, adapted to this app's tokens. */

export const Card = ({ className, ...props }: ComponentProps<"div">) => (
    <div
        data-slot="card"
        className={cn(
            "group/card flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white text-ink shadow-panel transition",
            "hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgb(35_24_21/0.28)]",
            className,
        )}
        {...props}
    />
);

export const CardMedia = ({ className, ...props }: ComponentProps<"div">) => (
    <div
        data-slot="card-media"
        className={cn("aspect-[4/3] overflow-hidden bg-ink/5", className)}
        {...props}
    />
);

export const CardHeader = ({ className, ...props }: ComponentProps<"div">) => (
    <div
        data-slot="card-header"
        className={cn("flex flex-col gap-1.5 px-5 pt-5", className)}
        {...props}
    />
);

export const CardTitle = ({ className, ...props }: ComponentProps<"h3">) => (
    <h3
        data-slot="card-title"
        className={cn(
            "m-0 font-sans text-xl leading-tight font-extrabold tracking-normal text-ink normal-case [text-shadow:none]",
            className,
        )}
        {...props}
    />
);

export const CardDescription = ({
    className,
    ...props
}: ComponentProps<"p">) => (
    <p
        data-slot="card-description"
        className={cn("m-0 text-base leading-snug text-ink/70", className)}
        {...props}
    />
);

export const CardContent = ({ className, ...props }: ComponentProps<"div">) => (
    <div
        data-slot="card-content"
        className={cn("flex-1 px-5 py-3", className)}
        {...props}
    />
);

export const CardFooter = ({ className, ...props }: ComponentProps<"div">) => (
    <div
        data-slot="card-footer"
        className={cn(
            "flex flex-wrap items-center justify-between gap-3 px-5 pt-1 pb-5",
            className,
        )}
        {...props}
    />
);
