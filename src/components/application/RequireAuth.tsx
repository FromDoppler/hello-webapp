import {
  useAppServices,
  useAppSessionUserData,
  NavigateToExternalUrl,
  LoadingScreen,
} from ".";

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const {
    appConfiguration: { loginPageUrl },
    window: { location },
  } = useAppServices();
  const sessionUserData = useAppSessionUserData();

  return sessionUserData.status === "unknown" ? (
    <LoadingScreen />
  ) : sessionUserData.status !== "authenticated" ? (
    // Important: redirect value should not be encoded
    <NavigateToExternalUrl to={`${loginPageUrl}?redirect=${location.href}`} />
  ) : (
    children
  );
};
