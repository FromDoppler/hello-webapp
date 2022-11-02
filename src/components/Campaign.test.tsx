import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppServices } from "../abstractions";
import { Field } from "../abstractions/doppler-rest-api-client";
import { HtmlEditorApiClient } from "../abstractions/html-editor-api-client";
import { AppServicesProvider } from "./AppServicesContext";
import { Campaign, editorTopBarTestId, errorMessageTestId } from "./Campaign";
import { TestDopplerIntlProvider } from "./i18n/TestDopplerIntlProvider";
import { act, render, screen, waitFor } from "@testing-library/react";

jest.mock("./LoadingScreen", () => ({
  LoadingScreen: () => <div>Loading...</div>,
}));

const dopplerLegacyBaseUrl = "http://dopplerlegacybaseurl";
const baseAppServices = {
  appSessionStateAccessor: {
    getCurrentSessionState: () => ({
      status: "authenticated",
      jwtToken: "jwtToken",
      dopplerAccountName: "dopplerAccountName",
    }),
  },
  appConfiguration: {
    unlayerProjectId: 12345,
    unlayerEditorManifestUrl: "unlayerEditorManifestUrl",
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

    screen.getByText("Loading...");

    const topBarMustBeNull = screen.queryByTestId(editorTopBarTestId);
    expect(topBarMustBeNull).toBeNull();

    const errorMessageEl = screen.queryByTestId(errorMessageTestId);
    expect(errorMessageEl).toBeNull();

    // Act
    rejectGetCampaignContentPromise(true);

    // Assert
    await screen.findByTestId(errorMessageTestId);

    expect(() => screen.getByText("Loading...")).toThrow();

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
    screen.getByText("Loading...");

    const errorMessageEl = screen.queryByTestId(errorMessageTestId);
    expect(errorMessageEl).toBeNull();

    expect(getCampaignContent).toHaveBeenCalledWith(idCampaign);

    // Act
    resolveGetCampaignContentPromise({ success: true, value: {} });

    // Assert
    await screen.findByTestId(editorTopBarTestId);

    expect(() => screen.getByText("Loading...")).toThrow();

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

  it.each([
    {
      buttonText: "continue",
      searchParams: "redirectedFromSummary=true",
      urlExpected: `${dopplerLegacyBaseUrl}/Campaigns/Summary/Index?IdCampaign=idCampaign`,
    },
    {
      buttonText: "continue",
      searchParams: "redirectedFromSummary=true&idABTest=idABTest",
      urlExpected: `${dopplerLegacyBaseUrl}/Campaigns/Summary/TestAB?IdCampaign=idABTest`,
    },
  ])(
    "should redirect to summary when $searchParams and user click in $buttonText",
    async ({ buttonText, urlExpected, searchParams }) => {
      // Arrange
      const initialEntries = `/idCampaign?${searchParams}`;
      // Act
      render(<DoubleEditorWithStateLoaded initialEntries={[initialEntries]} />);

      // Assert
      const buttonByText: HTMLAnchorElement = await screen.findByText(
        buttonText
      );
      expect(buttonByText.href).toEqual(urlExpected);
    }
  );

  it.each([
    {
      buttonText: "continue",
      searchParams: "redirectedFromSummary=false",
      urlExpected:
        `${dopplerLegacyBaseUrl}/Campaigns/Recipients/Index?IdCampaign=idCampaign` +
        `&RedirectedFromSummary=False&RedirectedFromTemplateList=False`,
    },
    {
      buttonText: "continue",
      searchParams: "redirectedFromSummary=false&idABTest=idABTest",
      urlExpected:
        `${dopplerLegacyBaseUrl}/Campaigns/Recipients/TestAB?IdCampaign=idABTest` +
        `&RedirectedFromSummary=False&RedirectedFromTemplateList=False`,
    },
  ])(
    "no should redirect to summary when $searchParams and user click in $buttonText",
    async ({ buttonText, urlExpected, searchParams }) => {
      // Arrange
      const initialEntries = [`/idCampaign?${searchParams}`];
      // Act
      render(<DoubleEditorWithStateLoaded initialEntries={initialEntries} />);
      // Assert
      const buttonByText: HTMLAnchorElement = await screen.findByText(
        buttonText
      );
      expect(buttonByText.href).toEqual(urlExpected);
    }
  );

  it.each([
    {
      searchParams: "redirectedFromSummary=true",
    },
    {
      searchParams: "redirectedFromSummary=true&idABTest=idABTest",
    },
    {
      searchParams: "redirectedFromSummary=false",
    },
    {
      searchParams: "redirectedFromSummary=false&idABTest=idABTest",
    },
  ])(
    "exit button should always redirect to campaign draft",
    async ({ searchParams }) => {
      // Arrange
      const buttonText = "exit_edit_later";
      //const urlExpected
      const initialEntries = `/idCampaign?${searchParams}`;

      // Act
      render(<DoubleEditorWithStateLoaded initialEntries={[initialEntries]} />);

      // Assert
      const buttonByText: HTMLAnchorElement = await screen.findByText(
        buttonText
      );
      expect(buttonByText.href).toEqual(
        baseAppServices.appConfiguration.dopplerExternalUrls.campaigns
      );
    }
  );
});
