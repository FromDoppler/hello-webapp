import { AppSessionData } from "./AppSessionData";

type AuthData = {
  jwtToken: string;
  dopplerAccountName: string;
};

export type AppSessionAuthData = AppSessionData<AuthData>;
