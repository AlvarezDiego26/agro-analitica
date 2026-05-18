export type AuthStoreState = {
  sessionStatus: "idle" | "authenticated" | "anonymous";
};

export const initialAuthStoreState: AuthStoreState = {
  sessionStatus: "idle"
};
