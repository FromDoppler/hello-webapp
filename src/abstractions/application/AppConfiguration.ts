export type AppConfiguration = {
  readonly basename: string | undefined;
  readonly appElementId: string;
  readonly keepAliveMilliseconds: number;
  readonly loginPageUrl: string;
  readonly loaderUrl: string;
  readonly dopplerLegacyBaseUrl: string;
  readonly htmlEditorApiBaseUrl: string;
  readonly dopplerRestApiBaseUrl: string;
  readonly useDummies: boolean;
  readonly dopplerExternalUrls: dopplerExternalUrls;
};

type dopplerExternalUrls = {
  readonly home: string;
  readonly campaigns: string;
  readonly lists: string;
  readonly controlPanel: string;
};
