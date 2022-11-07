import { useEffect, useState } from "react";
import { useAppServices } from ".";
import { AppSessionUserData } from "../../abstractions/application";
import { AppSessionStateContext } from "./AppSessionStateContext";

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
