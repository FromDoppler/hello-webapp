import { useContext } from "react";
import { AppSessionStateContext } from "./AppSessionStateContext";

export const useAppSessionUserData = () => useContext(AppSessionStateContext);
