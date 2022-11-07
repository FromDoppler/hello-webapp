import { act, render } from "@testing-library/react";
import {
  AppServicesProvider,
  AppSessionStateProvider,
  useAppSessionUserData,
} from ".";
import {
  AppServices,
  AppSessionStateAccessor,
  AppSessionStateMonitor,
  AppSessionUserData,
} from "../../abstractions/application";
import { SessionMfeAppSessionStateClient } from "../../implementations/session-mfe/SessionMfeAppSessionStateClient";

const expectedLang = "en";
const UNKNOWN_SESSION: AppSessionUserData = {
  status: "unknown",
};
const NON_AUTHENTICATED: AppSessionUserData = {
  status: "non-authenticated",
};
const AUTHENTICATED: AppSessionUserData = {
  lang: expectedLang,
  status: "authenticated",
  dopplerAccountName: "doppler_mock@mail.com",
};

describe("AppSessionStateProvider", () => {
  it("should update sessionUserData when 1st event comes after full rendering", () => {
    const {
      startMonitoringSessionState,
      TestComponent,
      inspectCurrentSessionUserData,
      simulateSessionUpdate,
    } = createTestContext();

    startMonitoringSessionState();

    render(<TestComponent />);

    expect(inspectCurrentSessionUserData()).toEqual(UNKNOWN_SESSION);
    act(() => {
      simulateSessionUpdate(NON_AUTHENTICATED);
    });
    expect(inspectCurrentSessionUserData()).toEqual(NON_AUTHENTICATED);

    act(() => {
      simulateSessionUpdate(AUTHENTICATED);
    });
    expect(inspectCurrentSessionUserData().jwtToken).toBeUndefined();
    expect(inspectCurrentSessionUserData().status).toEqual(
      AUTHENTICATED.status
    );
    expect(inspectCurrentSessionUserData().lang).toEqual(AUTHENTICATED.lang);
  });

  it("should update sessionState when 1st event comes after render but before useEffect", () => {
    const {
      startMonitoringSessionState,
      TestComponent,
      inspectCurrentSessionUserData,
      simulateSessionUpdate,
    } = createTestContext();

    expect(inspectCurrentSessionUserData()).toBeUndefined();

    startMonitoringSessionState();

    const ComponentToInjectCodeBeforeTestComponentUseEffect = () => {
      simulateSessionUpdate(AUTHENTICATED);
      return <></>;
    };

    render(
      <>
        <TestComponent />
        <ComponentToInjectCodeBeforeTestComponentUseEffect />
      </>
    );

    expect(inspectCurrentSessionUserData().status).toEqual(
      AUTHENTICATED.status
    );
    expect(inspectCurrentSessionUserData().lang).toEqual(AUTHENTICATED.lang);
  });

  it("should update sessionUserData when 1st event comes before rendering", () => {
    const {
      startMonitoringSessionState,
      TestComponent,
      inspectCurrentSessionUserData,
      simulateSessionUpdate,
    } = createTestContext();

    simulateSessionUpdate(AUTHENTICATED);

    startMonitoringSessionState();

    const ComponentToInjectCodeBeforeTestComponentUseEffect = () => {
      expect(inspectCurrentSessionUserData().status).toEqual(
        AUTHENTICATED.status
      );
      expect(inspectCurrentSessionUserData().lang).toEqual(AUTHENTICATED.lang);
      return <></>;
    };

    render(
      <>
        <TestComponent />
        <ComponentToInjectCodeBeforeTestComponentUseEffect />
      </>
    );
  });
});

function createTestContext() {
  let windowEventListener = () => {};
  const windowDouble: any = {
    addEventListener: (_eventName: string, listener: () => void) =>
      (windowEventListener = listener),
  };

  const simulateSessionUpdate = (newValue: any) => {
    windowDouble.dopplerSessionState = newValue;
    windowEventListener();
  };

  const appSessionStateClient = new SessionMfeAppSessionStateClient({
    window: windowDouble,
  });

  const appServices: AppServices = {
    appSessionStateAccessor: appSessionStateClient as AppSessionStateAccessor,
    appSessionStateMonitor: appSessionStateClient as AppSessionStateMonitor,
  } as AppServices;

  let currentSessionUserData: any;
  const inspectCurrentSessionUserData = () => currentSessionUserData;
  const ChildrenComponent = () => {
    currentSessionUserData = useAppSessionUserData();
    return <></>;
  };

  const startMonitoringSessionState = () => appSessionStateClient.start();
  const TestComponent = () => (
    <AppServicesProvider appServices={appServices}>
      <AppSessionStateProvider>
        <ChildrenComponent />
      </AppSessionStateProvider>
    </AppServicesProvider>
  );

  return {
    startMonitoringSessionState,
    TestComponent,
    inspectCurrentSessionUserData,
    simulateSessionUpdate,
  };
}
