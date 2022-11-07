export interface AppSessionStateMonitor {
  readonly start: () => void;
  onSessionUpdate: () => void;
}
