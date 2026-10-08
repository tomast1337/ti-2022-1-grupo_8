import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

export const Alert = ({ children }: { children: ReactNode }) => (
    <div
        role="alert"
        className="flex items-start gap-2 rounded-xl border border-tomato-600/30 bg-tomato-50 px-4 py-3 text-tomato-700"
    >
        <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
        <span>{children}</span>
    </div>
);
