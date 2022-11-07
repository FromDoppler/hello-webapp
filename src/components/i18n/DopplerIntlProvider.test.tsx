import { render, screen } from "@testing-library/react";
import { DopplerIntlProvider } from "./DopplerIntlProvider";
import { FormattedMessage } from "react-intl";
import { useAppSessionUserData } from "../application";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppSessionUserData } from "../../abstractions/application";

jest.mock("../application");
jest.mock("./en", () => ({
  messages_en: {
    lang: "en",
  },
}));
jest.mock("./es", () => ({
  messages_es: {
    lang: "es",
  },
}));

const UNKNOWN_SESSION: AppSessionUserData = {
  status: "unknown",
};
const NON_AUTHENTICATED: AppSessionUserData = {
  status: "non-authenticated",
};
const AUTHENTICATED: AppSessionUserData = {
  lang: "en",
  status: "authenticated",
  dopplerAccountName: "doppler_mock@mail.com",
};
const AUTHENTICATED_WITHOUT_LANG: any | AppSessionUserData = {
  status: "authenticated",
  dopplerAccountName: "doppler_mock@mail.com",
};
const LANG_DEFAULT = "es";

const DopplerIntlProviderTestWrapper = ({ initialEntries }: any) => (
  <MemoryRouter initialEntries={initialEntries}>
    <Routes>
      <Route
        path="/campaigns/:idCampaign"
        element={
          <DopplerIntlProvider>
            <FormattedMessage id="lang" />
          </DopplerIntlProvider>
        }
      />
    </Routes>
  </MemoryRouter>
);

describe(DopplerIntlProvider.name, () => {
  it.each([
    { sessionState: UNKNOWN_SESSION },
    { sessionState: NON_AUTHENTICATED },
  ])(
    `should translate using the default Spanish language when user state is $sessionState.status`,
    ({ sessionState }) => {
      // Arrange
      (useAppSessionUserData as jest.Mock).mockImplementation(
        () => sessionState
      );
      const entry = "/campaigns/000";
      // Act
      render(<DopplerIntlProviderTestWrapper initialEntries={[entry]} />);
      // Assert
      screen.getByText(LANG_DEFAULT);
    }
  );

  it.each([
    { userLanguage: "es", language: "spanish" },
    { userLanguage: "en", language: "english" },
  ])(
    `should translate a message to $language when user lang exists`,
    ({ userLanguage }) => {
      // Arrange
      (useAppSessionUserData as jest.Mock).mockImplementation(() => ({
        ...AUTHENTICATED,
        lang: userLanguage,
      }));
      const entry = "/campaigns/000";
      // Act
      render(<DopplerIntlProviderTestWrapper initialEntries={[entry]} />);
      // Assert
      screen.getByText(userLanguage);
    }
  );

  it(
    "should translate a message using the default language " +
      LANG_DEFAULT +
      " when user don't have lang",
    () => {
      (useAppSessionUserData as jest.Mock).mockImplementation(
        () => AUTHENTICATED_WITHOUT_LANG
      );
      // Arrange
      const entry = "/campaigns/000";
      // Act
      render(<DopplerIntlProviderTestWrapper initialEntries={[entry]} />);
      // Assert
      screen.getByText(LANG_DEFAULT);
    }
  );

  it.each([
    { userLanguage: "es", language: "spanish" },
    { userLanguage: "en", language: "english" },
  ])(
    "should translate a message to $language when query param lang is $userLanguage",
    ({ userLanguage }) => {
      (useAppSessionUserData as jest.Mock).mockImplementation(
        () => AUTHENTICATED_WITHOUT_LANG
      );
      // Arrange
      const entry = `/campaigns/000?lang=${userLanguage}`;
      // Act
      render(<DopplerIntlProviderTestWrapper initialEntries={[entry]} />);
      // Assert
      screen.getByText(userLanguage);
    }
  );
});
