export type AuthenticatedAppSessionState = {
  status: "authenticated";
  jwtToken: string;
  dopplerAccountName: string;
  lang: string;
};

export type AppSessionState =
  | { status: "unknown" }
  | { status: "non-authenticated" }
  | AuthenticatedAppSessionState;

export const defaultAppSessionState: AppSessionState = {
  status: "unknown",
};

export type AppSessionStateStatus = AppSessionState["status"];
