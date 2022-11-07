type AppSessionData<T> =
  | { readonly status: "unknown" }
  | { readonly status: "non-authenticated" }
  | ({
      readonly status: "authenticated";
    } & T);

type UserData = {
  dopplerAccountName: string;
  lang: string;
};

// AppSessionUserData will be shared using React Context
// So, it should be relatively stable, for that reason it
// does not include authentication information (the JWT
// token is updated on each request to GetUserData)
export type AppSessionUserData = AppSessionData<UserData>;

type AuthData = {
  jwtToken: string;
  dopplerAccountName: string;
};

export type AppSessionAuthData = AppSessionData<AuthData>;

export interface AppSessionStateAccessor {
  // AppSessionUserData will be shared using React Context
  // If there is no changes, the object should be the same
  // reference to avoid updates
  readonly getSessionUserData: () => AppSessionUserData;

  readonly getSessionAuthData: () => AppSessionAuthData;
}

export interface AppSessionStateMonitor {
  readonly start: () => void;
  onSessionUpdate: () => void;
}
