import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LoginResponse, Role, User } from "@pizzaria/dtos";

export interface SessionState {
    token: string | null;
    user: User | null;
}

const STORAGE_KEY = "session";

/** Reads the persisted session, dropping it if the JWT already expired. */
export const loadSession = (): SessionState => {
    const empty: SessionState = { token: null, user: null };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return empty;
        const session = JSON.parse(raw) as SessionState;
        if (!session.token || !session.user) return empty;
        const payload = JSON.parse(atob(session.token.split(".")[1] ?? "")) as {
            exp?: number;
        };
        if (payload.exp && payload.exp * 1000 < Date.now()) return empty;
        return session;
    } catch {
        return empty;
    }
};

export const saveSession = (session: SessionState) => {
    try {
        if (session.token) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        // storage unavailable (private mode): session lives in memory only
    }
};

const sessionSlice = createSlice({
    name: "session",
    initialState: loadSession,
    reducers: {
        signedIn: (_state, { payload }: PayloadAction<LoginResponse>) => ({
            token: payload.token,
            user: payload.user,
        }),
        signedOut: () => ({ token: null, user: null }),
    },
});

export const { signedIn, signedOut } = sessionSlice.actions;

export const selectToken = (state: { session: SessionState }) =>
    state.session.token;
export const selectUser = (state: { session: SessionState }) =>
    state.session.user;
export const selectRole = (state: { session: SessionState }): Role | null =>
    state.session.user?.role ?? null;

export default sessionSlice.reducer;
