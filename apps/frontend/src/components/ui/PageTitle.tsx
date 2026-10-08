import type { ReactNode } from "react";

/** Big white uppercase heading with a soft shadow, the app's signature look. */
export const PageTitle = ({ children }: { children: ReactNode }) => (
    <h1 className="my-6 flex items-center justify-center gap-3 text-center text-4xl font-extrabold tracking-wide text-white uppercase [text-shadow:1px_2px_6px_rgb(0_0_0/0.55)] sm:text-5xl">
        {children}
    </h1>
);
