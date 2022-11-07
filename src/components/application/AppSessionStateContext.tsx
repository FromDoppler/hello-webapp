import { createContext } from "react";
import { AppSessionUserData } from "../../abstractions/application";

export const AppSessionStateContext = createContext<AppSessionUserData>({
  status: "unknown",
});
