import { AppConfiguration } from "./abstractions/application";

export const defaultAppConfiguration: AppConfiguration = {
  basename: undefined,
  appElementId: "root",
  keepAliveMilliseconds: 300000,
  // Original WebApp shares the same domain than Hello WebApp. So, it is not
  // necessary to specify the domain, and the path is shared across environments
  loginPageUrl: "/login",
  loaderUrl: "https://cdn.fromdoppler.com/loader/v1/loader.js",
  dopplerLegacyBaseUrl: "https://appint.fromdoppler.net",
  htmlEditorApiBaseUrl: "https://apisint.fromdoppler.net/html-editor",
  dopplerRestApiBaseUrl: "https://restapi.fromdoppler.net",
  useDummies: true,
  dopplerExternalUrls: {
    home: "https://app.fromdoppler.com/dashboard",
    campaigns: "https://app2.fromdoppler.com/Campaigns/Draft",
    lists: "https://app2.fromdoppler.com/Lists/SubscribersList",
    controlPanel: "https://app2.fromdoppler.com/ControlPanel/ControlPanel",
  },
};
