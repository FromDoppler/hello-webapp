import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppServices } from "../abstractions/application";
import { Field } from "../abstractions/doppler-rest-api-client";
import { HtmlEditorApiClient } from "../abstractions/html-editor-api-client";
import { AppServicesProvider } from "./application";
import { Campaign, editorTopBarTestId, errorMessageTestId } from "./Campaign";
import { TestDopplerIntlProvider } from "./i18n/TestDopplerIntlProvider";
import { act, render, screen, waitFor } from "@testing-library/react";

const dopplerLegacyBaseUrl = "http://dopplerlegacybaseurl";
const baseAppServices = {
  appSessionStateAccessor: {
    getSessionUserData: () => ({
      status: "authenticated",
      dopplerAccountName: "dopplerAccountName",
    }),
    getSessionAuthData: () => ({
      status: "authenticated",
      dopplerAccountName: "dopplerAccountName",
      jwtToken: "jwtToken",
    }),
  },
  appConfiguration: {
    loaderUrl: "loaderUrl",
    dopplerLegacyBaseUrl,
    dopplerExternalUrls: {
      home: "https://dopplerexternalurls.home/",
      campaigns: "https://dopplerexternalurls.campaigns/",
      lists: "https://dopplerexternalurls.lists/",
      controlPanel: "https://dopplerexternalurls.controlpanel/",
    },
  },
  dopplerRestApiClient: {
    getFields: () => Promise.resolve({ success: true, value: [] as Field[] }),
  },
} as AppServices;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

interface SetEditorAsLoadedProps {
  initialEntries: string[];
}

const DoubleEditorWithStateLoaded = ({
  initialEntries,
}: SetEditorAsLoadedProps) => {
  const getCampaignContent = () =>
    Promise.resolve({ success: true, value: {} });
  const updateCampaignContent = jest.fn(() =>
    Promise.resolve({ success: true, value: {} })
  );

  const htmlEditorApiClient = {
    getCampaignContent,
    updateCampaignContent,
  } as unknown as HtmlEditorApiClient;

  return (
    <QueryClientProvider client={queryClient}>
      <AppServicesProvider
        appServices={{ ...baseAppServices, htmlEditorApiClient }}
      >
        <TestDopplerIntlProvider>
          <MemoryRouter initialEntries={initialEntries}>
            <Routes>
              <Route path="/:idCampaign" element={<Campaign />} />
            </Routes>
          </MemoryRouter>
        </TestDopplerIntlProvider>
      </AppServicesProvider>
    </QueryClientProvider>
  );
};

describe(Campaign.name, () => {
  it("should show loading and then error when getCampaignContent is not successful", async () => {
    // Arrange
    const idCampaign = "1234";

    let rejectGetCampaignContentPromise: any;
    const getCampaignContent = jest.fn(
      () =>
        new Promise((_, reject) => {
          rejectGetCampaignContentPromise = reject;
        })
    );

    const htmlEditorApiClient = {
      getCampaignContent,
    } as unknown as HtmlEditorApiClient;

    // Act
    render(
      <QueryClientProvider client={queryClient}>
        <AppServicesProvider
          appServices={{ ...baseAppServices, htmlEditorApiClient }}
        >
          <TestDopplerIntlProvider>
            <MemoryRouter initialEntries={[`/${idCampaign}`]}>
              <Routes>
                <Route path="/:idCampaign" element={<Campaign />} />
              </Routes>
            </MemoryRouter>
          </TestDopplerIntlProvider>
        </AppServicesProvider>
      </QueryClientProvider>
    );

    // Assert
    expect(getCampaignContent).toHaveBeenCalledWith(idCampaign);

    screen.getByTestId("loading-page");

    const topBarMustBeNull = screen.queryByTestId(editorTopBarTestId);
    expect(topBarMustBeNull).toBeNull();

    const errorMessageEl = screen.queryByTestId(errorMessageTestId);
    expect(errorMessageEl).toBeNull();

    // Act
    rejectGetCampaignContentPromise(true);

    // Assert
    await screen.findByTestId(errorMessageTestId);

    expect(() => screen.getByTestId("loading-page")).toThrow();

    const editorTobBarEl = screen.queryByTestId(editorTopBarTestId);
    expect(editorTobBarEl).toBeNull();
  });

  it("should show EmailEditor when the getCampaignContent is successful", async () => {
    // Arrange
    const idCampaign = "1234";

    let resolveGetCampaignContentPromise: any;
    const getCampaignContent = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveGetCampaignContentPromise = resolve;
        })
    );

    const htmlEditorApiClient = {
      getCampaignContent,
    } as unknown as HtmlEditorApiClient;

    // Act
    render(
      <QueryClientProvider client={queryClient}>
        <AppServicesProvider
          appServices={{ ...baseAppServices, htmlEditorApiClient }}
        >
          <TestDopplerIntlProvider>
            <MemoryRouter initialEntries={[`/${idCampaign}`]}>
              <Routes>
                <Route path="/:idCampaign" element={<Campaign />} />
              </Routes>
            </MemoryRouter>
          </TestDopplerIntlProvider>
        </AppServicesProvider>
      </QueryClientProvider>
    );

    // Assert
    screen.getByTestId("loading-page");

    const errorMessageEl = screen.queryByTestId(errorMessageTestId);
    expect(errorMessageEl).toBeNull();

    expect(getCampaignContent).toHaveBeenCalledWith(idCampaign);

    // Act
    resolveGetCampaignContentPromise({ success: true, value: {} });

    // Assert
    await screen.findByTestId(editorTopBarTestId);

    expect(() => screen.getByTestId("loading-page")).toThrow();

    const errorMessageEl2 = screen.queryByTestId(errorMessageTestId);
    expect(errorMessageEl2).toBeNull();

    screen.getByTestId(editorTopBarTestId);
  });

  it("should call API client to store the editor data when the user clicks on save", async () => {
    // Arrange
    const idCampaign = "1234";

    const getCampaignContent = () =>
      Promise.resolve({ success: true, value: {} });
    const updateCampaignContent = jest.fn(() =>
      Promise.resolve({ success: true, value: {} })
    );

    const htmlEditorApiClient = {
      getCampaignContent,
      updateCampaignContent,
    } as unknown as HtmlEditorApiClient;

    // Act
    render(
      <QueryClientProvider client={queryClient}>
        <AppServicesProvider
          appServices={{ ...baseAppServices, htmlEditorApiClient }}
        >
          <TestDopplerIntlProvider>
            <MemoryRouter initialEntries={[`/${idCampaign}`]}>
              <Routes>
                <Route path="/:idCampaign" element={<Campaign />} />
              </Routes>
            </MemoryRouter>
          </TestDopplerIntlProvider>
        </AppServicesProvider>
      </QueryClientProvider>
    );

    // Assert
    const saveBtn = await screen.findByText("save");

    act(() => saveBtn.click());

    await waitFor(() => {
      expect(updateCampaignContent).toHaveBeenCalledWith(
        idCampaign,
        expect.anything()
      );
    });
  });

  it("exit button should always redirect to campaign draft", async () => {
    // Arrange
    const buttonText = "exit_edit_later";
    //const urlExpected
    const initialEntries = `/idCampaign`;

    // Act
    render(<DoubleEditorWithStateLoaded initialEntries={[initialEntries]} />);

    // Assert
    const buttonByText: HTMLAnchorElement = await screen.findByText(buttonText);
    expect(buttonByText.href).toEqual(
      baseAppServices.appConfiguration.dopplerExternalUrls.campaigns
    );
  });
});
