import type { AppDispatch } from "../../app/store";
import { endSession, refreshSession } from "../../services/refresh";
import { signedIn, signedOut } from "./sessionSlice";

/** On page load: turn the refresh cookie, if any, back into a session. */
export const restoreSession = () => async (dispatch: AppDispatch) => {
    const session = await refreshSession();
    if (session) dispatch(signedIn(session));
};

/** Signs out at once in the UI and revokes the refresh token in the background. */
export const signOut = () => (dispatch: AppDispatch) => {
    dispatch(signedOut());
    void endSession();
};
