import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LoginResponse, Role, User } from "@pizzaria/dtos";

export interface SessionState {
    token: string | null;
    user: User | null;
}

/**
 * The access token lives in memory only. The long-lived credential is an
 * httpOnly refresh cookie that scripts cannot read; `restoreSession` and the
 * API client use it to get a new access token.
 */
const sessionSlice = createSlice({
    name: "session",
    initialState: { token: null, user: null } as SessionState,
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
