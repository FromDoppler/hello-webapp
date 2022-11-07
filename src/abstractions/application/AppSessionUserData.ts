import { AppSessionData } from "./AppSessionData";

type UserData = {
  dopplerAccountName: string;
  lang: string;
};

// AppSessionUserData will be shared using React Context
// So, it should be relatively stable, for that reason it
// does not include authentication information (the JWT
// token is updated on each request to GetUserData)
export type AppSessionUserData = AppSessionData<UserData>;
