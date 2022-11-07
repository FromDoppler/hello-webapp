import { createContext, useContext, useEffect, useState } from "react";
import { AppSessionUserData } from "../abstractions/app-session";
import { useAppServices } from "./AppServicesContext";

export const AppSessionStateContext = createContext<AppSessionUserData>({
  status: "unknown",
});

export const AppSessionStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { appSessionStateAccessor, appSessionStateMonitor } = useAppServices();
  const initialState = appSessionStateAccessor.getSessionUserData();
  const [appSessionState, setAppSessionState] =
    useState<AppSessionUserData>(initialState);

  useEffect(() => {
    appSessionStateMonitor.onSessionUpdate = () => {
      const newState = appSessionStateAccessor.getSessionUserData();
      setAppSessionState(newState);
    };

    appSessionStateMonitor.onSessionUpdate();

    return () => {
      appSessionStateMonitor.onSessionUpdate = () => {};
    };
  }, [appSessionStateMonitor, appSessionStateAccessor]);

  return (
    <AppSessionStateContext.Provider value={appSessionState}>
      {children}
    </AppSessionStateContext.Provider>
  );
};

export const useAppSessionUserData = () => useContext(AppSessionStateContext);
