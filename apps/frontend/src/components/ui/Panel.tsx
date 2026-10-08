import type { HTMLAttributes } from "react";
import { cn } from "./cn";

/** Frosted-glass card floating over the page background. */
export const Panel = ({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "rounded-panel bg-white/85 p-6 shadow-panel backdrop-blur-md",
            className,
        )}
        {...props}
    />
);
