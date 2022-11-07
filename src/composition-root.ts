import axios from "axios";
import { AppConfiguration, AppServices } from "./abstractions/application";
import { AppConfigurationRendererImplementation } from "./implementations/AppConfigurationRendererImplementation";
import { SessionMfeAppSessionStateClient } from "./implementations/session-mfe/SessionMfeAppSessionStateClient";
import {
  ServicesFactories,
  SingletonLazyAppServicesContainer,
} from "./implementations/SingletonLazyAppServicesContainer";
import { defaultAppConfiguration } from "./default-configuration";
import { DummyHtmlEditorApiClient } from "./implementations/dummies/html-editor-api-client";
import { HtmlEditorApiClientImpl } from "./implementations/HtmlEditorApiClientImpl";
import { DummyDopplerRestApiClient } from "./implementations/dummies/doppler-rest-api-client";
import { DopplerRestApiClientImpl } from "./implementations/DopplerRestApiClientImpl";

export const configureApp = (
  customConfiguration: Partial<AppConfiguration>
): AppServices => {
  const appConfiguration = {
    ...defaultAppConfiguration,
    ...customConfiguration,
  };

  const realFactories: ServicesFactories = {
    windowFactory: () => window,
    axiosStaticFactory: () => axios,
    appConfigurationFactory: () => appConfiguration,
    appConfigurationRendererFactory: (appServices: AppServices) =>
      new AppConfigurationRendererImplementation(appServices),
    htmlEditorApiClientFactory: (appServices) =>
      new HtmlEditorApiClientImpl({
        axiosStatic: appServices.axiosStatic,
        appSessionStateAccessor: appServices.appSessionStateAccessor,
        appConfiguration: appServices.appConfiguration,
      }),
    dopplerRestApiClientFactory: ({
      axiosStatic,
      appSessionStateAccessor,
      appConfiguration,
    }) =>
      new DopplerRestApiClientImpl({
        axiosStatic,
        appSessionStateAccessor,
        appConfiguration,
      }),
    appSessionStateMonitorFactory: ({ window }: AppServices) =>
      new SessionMfeAppSessionStateClient({ window }),
    appSessionStateAccessorFactory: ({ appSessionStateMonitor }: AppServices) =>
      // Casting because the same instance of SessionMfeAppSessionStateClient
      // will be use for appSessionStateMonitor and appSessionStateAccessor
      appSessionStateMonitor as SessionMfeAppSessionStateClient,
  };

  const dummyFactories: Partial<ServicesFactories> = {
    htmlEditorApiClientFactory: () => new DummyHtmlEditorApiClient(),
    dopplerRestApiClientFactory: () => new DummyDopplerRestApiClient(),
  };

  const factories = appConfiguration.useDummies
    ? { ...realFactories, ...dummyFactories }
    : realFactories;

  const appServices = new SingletonLazyAppServicesContainer(factories);

  return appServices;
};
