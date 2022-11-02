import { AppConfiguration } from ".";
import { AxiosStatic } from "axios";
import { AppConfigurationRenderer } from "./app-configuration-renderer";
import { AppSessionStateAccessor, AppSessionStateMonitor } from "./app-session";
import { HtmlEditorApiClient } from "./html-editor-api-client";
import { DopplerRestApiClient } from "./doppler-rest-api-client";

export type AppServices = {
  window: Window;
  axiosStatic: AxiosStatic;
  appConfiguration: AppConfiguration;
  appConfigurationRenderer: AppConfigurationRenderer;
  htmlEditorApiClient: HtmlEditorApiClient;
  dopplerRestApiClient: DopplerRestApiClient;
  appSessionStateAccessor: AppSessionStateAccessor;
  appSessionStateMonitor: AppSessionStateMonitor;
};
