import React, { useEffect, useState } from "react";
import { IntlProvider } from "react-intl";
import { messages_en } from "./en";
import { messages_es } from "./es";
import { flattenMessages, sanitizeLanguageOrDefault } from "./utils";
import { useAppSessionUserData } from "../application";
import { useSearchParams } from "react-router-dom";

const messages = {
  es: messages_es,
  en: messages_en,
};

interface DopplerIntlProviderProps {
  children: React.ReactNode;
}

export const DopplerIntlProvider = ({ children }: DopplerIntlProviderProps) => {
  const [searchParams] = useSearchParams();
  const sessionUserData = useAppSessionUserData();
  const [locale, setLocale] = useState("es");

  const langQueryParam = searchParams.get("lang");

  useEffect(() => {
    if (langQueryParam) {
      setLocale(
        sanitizeLanguageOrDefault(langQueryParam, Object.keys(messages))
      );
    } else if (
      sessionUserData.status === "authenticated" &&
      sessionUserData.lang
    ) {
      setLocale(
        sanitizeLanguageOrDefault(sessionUserData.lang, Object.keys(messages))
      );
    }
  }, [sessionUserData, langQueryParam]);

  return (
    <IntlProvider
      locale={locale}
      messages={flattenMessages(messages[locale as keyof typeof messages])}
    >
      {children}
    </IntlProvider>
  );
};
