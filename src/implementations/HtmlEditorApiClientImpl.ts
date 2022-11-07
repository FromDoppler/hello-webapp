import { Result } from "../abstractions/result-types";
import {
  AppConfiguration,
  AppSessionStateAccessor,
} from "../abstractions/application";
import { HtmlEditorApiClient } from "../abstractions/html-editor-api-client";
import { AxiosStatic, Method } from "axios";
import { Content } from "../abstractions/domain/content";

export class HtmlEditorApiClientImpl implements HtmlEditorApiClient {
  private axios;
  private appSessionStateAccessor;

  constructor({
    axiosStatic,
    appSessionStateAccessor,
    appConfiguration: { htmlEditorApiBaseUrl },
  }: {
    axiosStatic: AxiosStatic;
    appSessionStateAccessor: AppSessionStateAccessor;
    appConfiguration: Partial<AppConfiguration>;
  }) {
    this.axios = axiosStatic.create({
      baseURL: htmlEditorApiBaseUrl,
    });
    this.appSessionStateAccessor = appSessionStateAccessor;
  }

  private getConnectionData() {
    const connectionData = this.appSessionStateAccessor.getSessionAuthData();
    if (connectionData.status !== "authenticated") {
      throw new Error("Authenticated session required");
    }
    return {
      accountName: connectionData.dopplerAccountName,
      jwtToken: connectionData.jwtToken,
    };
  }

  private request<T>(method: Method, url: string, data: unknown = undefined) {
    const { accountName, jwtToken } = this.getConnectionData();
    return this.axios.request<T>({
      method,
      url: `/accounts/${accountName}${url}`,
      headers: { Authorization: `Bearer ${jwtToken}` },
      data,
    });
  }

  private GET<T>(url: string) {
    return this.request<T>("GET", url);
  }

  private PUT(url: string, data: unknown) {
    return this.request<any>("PUT", url, data);
  }

  async getCampaignContent(campaignId: string): Promise<Result<Content>> {
    const response = await this.GET<any>(`/campaigns/${campaignId}/content`);

    if (response.data.type === "html") {
      return {
        success: true,
        value: {
          htmlContent: response.data.htmlContent,
          previewImage: response.data.previewImage || "",
          type: "html",
        },
      };
    }

    // TODO: validate the type for unlayer design responses

    return {
      success: true,
      value: {
        // TODO: consider to sanitize and validate this response
        htmlContent: response.data.htmlContent,
        previewImage: response.data.previewImage || "",
        type: "html",
      },
    };
  }

  async updateCampaignContent(
    campaignId: string,
    content: Content
  ): Promise<Result> {
    const body = {
      htmlContent: content.htmlContent,
      previewImage: content.previewImage,
      type: "html",
    };

    await this.PUT(`/campaigns/${campaignId}/content`, body);
    return { success: true };
  }
}
