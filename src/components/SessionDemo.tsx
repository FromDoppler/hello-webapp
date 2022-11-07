import { useAppServices, useAppSessionUserData } from "./application";

export const SessionDemo = () => {
  const { appSessionStateAccessor } = useAppServices();
  const sessionUserData = useAppSessionUserData();
  return (
    <>
      <code>
        <pre>
          SessionStateStatus from context: {sessionUserData.status}
          <br />
          UserData from context: {JSON.stringify(sessionUserData)}
          <br />
          AuthData from AppServices:{" "}
          {JSON.stringify(appSessionStateAccessor.getSessionAuthData())}
        </pre>
      </code>
      <p>
        SessionState from AppServices could be not rendered updated because
        React does not know when it changes. If we need updated in a React
        component, we can use <code>AppSessionUserData()</code>
      </p>
    </>
  );
};
