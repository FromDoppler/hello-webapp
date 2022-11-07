import { AppConfiguration, AppServices } from "../abstractions/application";

export class AppConfigurationRendererImplementation {
  private readonly _appConfiguration: AppConfiguration;

  constructor({ appConfiguration }: AppServices) {
    this._appConfiguration = appConfiguration;
  }

  getConfigurationAsJsonString() {
    return JSON.stringify(this._appConfiguration, null, "  ");
  }
}
