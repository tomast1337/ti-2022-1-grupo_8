import { API_URL } from "./config";

/** Image paths come from the API as "/imgs/..." or "/uploads/..."; empty means none. */
export const imageUrl = (path: string | undefined): string | undefined =>
    path ? `${API_URL}${path}` : undefined;
