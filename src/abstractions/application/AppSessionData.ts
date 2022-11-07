export type AppSessionData<T> =
  | { readonly status: "unknown" }
  | { readonly status: "non-authenticated" }
  | ({
      readonly status: "authenticated";
    } & T);
