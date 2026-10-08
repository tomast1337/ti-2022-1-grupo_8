import type { ComponentProps } from "react";
import { cn } from "./cn";

type Tone = "default" | "success" | "warning";

const TONE: Record<Tone, string> = {
    default: "bg-ink/10 text-ink",
    success: "bg-basil-600/15 text-basil-700",
    warning: "bg-cheese-500/25 text-ink",
};

export const Badge = ({
    tone = "default",
    className,
    ...props
}: ComponentProps<"span"> & { tone?: Tone }) => (
    <span
        data-slot="badge"
        className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold",
            TONE[tone],
            className,
        )}
        {...props}
    />
);
