import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppServices } from "../abstractions/application";
import { Field } from "../abstractions/doppler-rest-api-client";
import { AppServicesProvider } from "./application";
import { Main, mainTestId } from "./Main";
import { TestDopplerIntlProvider } from "./i18n/TestDopplerIntlProvider";

const baseAppServices = {
  appSessionStateAccessor: {
    getSessionUserData: () => ({}),
    getSessionAuthData: () => ({}),
  },
  appConfiguration: {},
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

describe("Main.name", () => {
  it("renders learn react link", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AppServicesProvider appServices={baseAppServices}>
          <TestDopplerIntlProvider>
            <BrowserRouter>
              <Main />
            </BrowserRouter>
          </TestDopplerIntlProvider>
        </AppServicesProvider>
      </QueryClientProvider>
    );
    const outletElement = screen.queryByTestId(mainTestId);
    expect(outletElement).toBeInTheDocument();
  });
});
