import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Joins class names and resolves conflicting Tailwind utilities. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
