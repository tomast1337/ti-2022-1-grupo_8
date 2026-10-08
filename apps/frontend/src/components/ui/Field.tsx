import type { ReactNode } from "react";

/** Label above a form control; `htmlFor` must match the control's id. */
export const Field = ({
    label,
    htmlFor,
    children,
}: {
    label: string;
    htmlFor: string;
    children: ReactNode;
}) => (
    <div className="space-y-1.5">
        <label
            htmlFor={htmlFor}
            className="block text-base font-extrabold text-ink"
        >
            {label}
        </label>
        {children}
    </div>
);

export const FILE_INPUT_CLASS =
    "cursor-pointer file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-ink/10 file:px-3 file:py-1.5 file:font-bold file:text-ink";
