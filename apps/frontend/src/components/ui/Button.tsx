import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "accent" | "danger" | "ghost";
type Size = "sm" | "md";

const VARIANT: Record<Variant, string> = {
    primary:
        "bg-tomato-600 text-white hover:bg-tomato-700 focus-visible:outline-tomato-600",
    secondary:
        "bg-basil-600 text-white hover:bg-basil-700 focus-visible:outline-basil-600",
    accent: "bg-cheese-500 text-ink hover:bg-cheese-400 focus-visible:outline-cheese-600",
    danger: "bg-ink text-white hover:bg-black focus-visible:outline-ink",
    ghost: "bg-white/70 text-ink hover:bg-white focus-visible:outline-ink",
};

const SIZE: Record<Size, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
};

interface StyleOptions {
    variant?: Variant;
    size?: Size;
    block?: boolean;
}

/** Class names for buttons, also usable on router links. */
export const buttonClass = ({
    variant = "primary",
    size = "md",
    block = false,
}: StyleOptions = {}) =>
    cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 font-bold no-underline shadow-sm transition",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT[variant],
        SIZE[size],
        block && "w-full",
    );

export const Button = ({
    variant,
    size,
    block,
    className,
    type = "button",
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & StyleOptions) => (
    <button
        type={type}
        className={cn(buttonClass({ variant, size, block }), className)}
        {...props}
    />
);
