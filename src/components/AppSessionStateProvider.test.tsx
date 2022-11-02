import { act, render } from "@testing-library/react";
import {
  AppSessionStateProvider,
  useAppSessionState,
} from "./AppSessionStateContext";
import { AppServicesProvider } from "./AppServicesContext";
import { AppServices } from "../abstractions";
import { AppSessionState } from "../abstractions/app-session";
import {
  DopplerSessionMfeAppSessionStateAccessor,
  DopplerSessionMfeAppSessionStateMonitor,
} from "../implementations/app-session/doppler-mfe-app-session-state-monitor";

const expectedLang = "en";
const UNKNOWN_SESSION: AppSessionState = {
  status: "unknown",
};
const NON_AUTHENTICATED: AppSessionState = {
  status: "non-authenticated",
};
const AUTHENTICATED: AppSessionState = {
  lang: expectedLang,
  status: "authenticated",
  jwtToken: "jwt",
  dopplerAccountName: "doppler_mock@mail.com",
};

describe("AppSessionStateProvider", () => {
  it("should update sessionState when 1st event comes after full rendering", () => {
    const {
      startMonitoringSessionState,
      TestComponent,
      inspectCurrentSessionState,
      simulateSessionUpdate,
    } = createTestContext();

    startMonitoringSessionState();

    render(<TestComponent />);

    expect(inspectCurrentSessionState()).toEqual(UNKNOWN_SESSION);
    act(() => {
      simulateSessionUpdate(NON_AUTHENTICATED);
    });
    expect(inspectCurrentSessionState()).toEqual(NON_AUTHENTICATED);

    act(() => {
      simulateSessionUpdate(AUTHENTICATED);
    });
    expect(inspectCurrentSessionState().jwtToken).toBeUndefined();
    expect(inspectCurrentSessionState().status).toEqual(AUTHENTICATED.status);
    expect(inspectCurrentSessionState().lang).toEqual(AUTHENTICATED.lang);
  });

  it("should update sessionState when 1st event comes after render but before useEffect", () => {
    const {
      startMonitoringSessionState,
      TestComponent,
      inspectCurrentSessionState,
      simulateSessionUpdate,
    } = createTestContext();

    expect(inspectCurrentSessionState()).toBeUndefined();

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

    expect(inspectCurrentSessionState().status).toEqual(AUTHENTICATED.status);
    expect(inspectCurrentSessionState().lang).toEqual(AUTHENTICATED.lang);
  });

  it("should update sessionState when 1st event comes before rendering", () => {
    const {
      startMonitoringSessionState,
      TestComponent,
      inspectCurrentSessionState,
      simulateSessionUpdate,
    } = createTestContext();

    simulateSessionUpdate(AUTHENTICATED);

    startMonitoringSessionState();

    const ComponentToInjectCodeBeforeTestComponentUseEffect = () => {
      expect(inspectCurrentSessionState().status).toEqual(AUTHENTICATED.status);
      expect(inspectCurrentSessionState().lang).toEqual(AUTHENTICATED.lang);
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

  const appSessionStateAccessor = new DopplerSessionMfeAppSessionStateAccessor({
    window: windowDouble,
  });
  const appSessionStateMonitor = new DopplerSessionMfeAppSessionStateMonitor({
    window: windowDouble,
  });

  const appServices: AppServices = {
    appSessionStateMonitor,
    appSessionStateAccessor,
  } as unknown as AppServices;

  let currentStateSession: any;
  const inspectCurrentSessionState = () => currentStateSession;
  const ChildrenComponent = () => {
    currentStateSession = useAppSessionState();
    return <></>;
  };

  const startMonitoringSessionState = () => appSessionStateMonitor.start();
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
    inspectCurrentSessionState,
    simulateSessionUpdate,
  };
}
