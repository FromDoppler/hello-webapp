import { AppSessionAuthData } from "./AppSessionAuthData";
import { AppSessionUserData } from "./AppSessionUserData";

export interface AppSessionStateAccessor {
  // AppSessionUserData will be shared using React Context
  // If there is no changes, the object should be the same
  // reference to avoid updates
  readonly getSessionUserData: () => AppSessionUserData;

  readonly getSessionAuthData: () => AppSessionAuthData;
}
