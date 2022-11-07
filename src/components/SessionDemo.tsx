import { useAppServices, useAppSessionUserData } from "./application";

export const SessionDemo = () => {
  const { appSessionStateAccessor } = useAppServices();
  const sessionUserData = useAppSessionUserData();
  return (
    <>
      <code>
        <pre>
          SessionStateStatus from sessionUserData: {sessionUserData.status}
          <br />
          UserData from context: {JSON.stringify(sessionUserData, null, " ")}
          <br />
          AuthData from AppServices:{" "}
          {JSON.stringify(
            appSessionStateAccessor.getSessionAuthData(),
            null,
            " "
          )}
        </pre>
      </code>
    </>
  );
};
