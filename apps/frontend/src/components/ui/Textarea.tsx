import type { TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

export const Textarea = ({
    className,
    ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        className={cn(
            "min-h-24 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-base text-ink shadow-inner",
            "placeholder:text-ink/50 focus:border-tomato-600 focus:outline-2 focus:outline-tomato-600/30",
            className,
        )}
        {...props}
    />
);
