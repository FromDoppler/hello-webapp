import { AppServices } from "../../abstractions/application";
import { AppServicesContext } from "./AppServicesContext";

export const AppServicesProvider = ({
  children,
  appServices,
}: {
  children: React.ReactNode;
  appServices: AppServices;
}) => (
  <AppServicesContext.Provider value={appServices}>
    {children}
  </AppServicesContext.Provider>
);
