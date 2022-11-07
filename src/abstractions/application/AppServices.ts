import { AxiosStatic } from "axios";
import {
  AppConfiguration,
  AppSessionStateAccessor,
  AppSessionStateMonitor,
} from ".";
import { AppConfigurationRenderer } from "../app-configuration-renderer";
import { HtmlEditorApiClient } from "../html-editor-api-client";
import { DopplerRestApiClient } from "../doppler-rest-api-client";

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
