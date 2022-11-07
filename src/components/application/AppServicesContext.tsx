import { createContext } from "react";

import { AppServices } from "../../abstractions/application";

// I have not the default services available yet :(
const defaultAppServices = {} as AppServices;

export const AppServicesContext =
  createContext<AppServices>(defaultAppServices);
