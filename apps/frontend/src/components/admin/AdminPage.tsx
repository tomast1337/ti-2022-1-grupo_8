import type { ReactNode } from "react";
import backgroundUrl from "../../assets/admin-background.png";

/** Page frame for the admin area: dark veil so the white headings read. */
export const AdminPage = ({ children }: { children: ReactNode }) => (
    <div
        className="min-h-screen bg-cover bg-fixed bg-no-repeat font-sans"
        style={{
            backgroundImage: `linear-gradient(rgb(0 0 0 / 0.45), rgb(0 0 0 / 0.45)), url(${backgroundUrl})`,
        }}
    >
        {children}
    </div>
);
