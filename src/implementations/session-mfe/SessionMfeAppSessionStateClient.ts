import {
  AppSessionAuthData,
  AppSessionUserData,
  AppSessionStateAccessor,
  AppSessionStateMonitor,
} from "../../abstractions/application";
import { DOPPLER_SESSION_STATE_UPDATE_EVENT_TYPE } from "./session-mfe-conventions";

export class SessionMfeAppSessionStateClient
  implements AppSessionStateMonitor, AppSessionStateAccessor
{
  private readonly _window;
  private _cachedAppSessionUserData: AppSessionUserData = { status: "unknown" };

  public onSessionUpdate: () => void = () => {};
  constructor({ window }: { window: Window }) {
    this._window = window;
  }

  getSessionUserData(): AppSessionUserData {
    const dopplerSessionState = this._window.dopplerSessionState;
    if (!dopplerSessionState) {
      return (this._cachedAppSessionUserData =
        this._cachedAppSessionUserData.status === "unknown"
          ? this._cachedAppSessionUserData
          : { status: "unknown" });
    }

    if (dopplerSessionState.status === "non-authenticated") {
      return (this._cachedAppSessionUserData =
        this._cachedAppSessionUserData.status === "non-authenticated"
          ? this._cachedAppSessionUserData
          : { status: "non-authenticated" });
    }

    // Status is authenticated

    if (
      this._cachedAppSessionUserData.status === dopplerSessionState.status &&
      this._cachedAppSessionUserData.dopplerAccountName ===
        dopplerSessionState.dopplerAccountName &&
      this._cachedAppSessionUserData.lang === dopplerSessionState.lang
    ) {
      return this._cachedAppSessionUserData;
    }

    return {
      status: "authenticated",
      dopplerAccountName: dopplerSessionState.dopplerAccountName,
      lang: dopplerSessionState.lang,
    };
  }

  getSessionAuthData(): AppSessionAuthData {
    const dopplerSessionState = this._window.dopplerSessionState;
    if (!dopplerSessionState) {
      return { status: "unknown" };
    }

    if (dopplerSessionState.status === "non-authenticated") {
      return { status: "non-authenticated" };
    }

    // Status is authenticated

    return {
      status: "authenticated",
      dopplerAccountName: dopplerSessionState.dopplerAccountName,
      jwtToken: dopplerSessionState.jwtToken,
    };
  }

  start() {
    this._window.addEventListener(
      DOPPLER_SESSION_STATE_UPDATE_EVENT_TYPE,
      () => {
        this.onSessionUpdate();
      }
    );
    this.onSessionUpdate();
  }
}
