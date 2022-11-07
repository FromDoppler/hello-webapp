import { AppServices } from "../../abstractions/application";
import { AppServicesContext } from "./AppServicesContext";

export function injectAppServices<
  T extends { appServices: Partial<AppServices> }
>(Component: (props1: T) => JSX.Element) {
  // TODO: Use the right type for in the return props parameter
  // TODO: It only inject the appServices when it is not defined. I cannot extend the object because
  // it has properties. Maybe a mix could be created with a proxy.
  return (props: any) =>
    props.appServices ? (
      <Component {...props} />
    ) : (
      <AppServicesContext.Consumer>
        {(appServices) => <Component {...props} appServices={appServices} />}
      </AppServicesContext.Consumer>
    );
}
