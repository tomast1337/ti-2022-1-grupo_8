import type { ReactNode } from "react";
import backgroundUrl from "../../assets/employee-background.png";

/** Page frame for the employee area. */
export const EmployeePage = ({ children }: { children: ReactNode }) => (
    <div
        className="min-h-screen bg-cover bg-fixed bg-no-repeat font-sans"
        style={{
            backgroundImage: `linear-gradient(rgb(255 255 255 / 0.5), rgb(255 255 255 / 0.5)), url(${backgroundUrl})`,
        }}
    >
        {children}
    </div>
);
