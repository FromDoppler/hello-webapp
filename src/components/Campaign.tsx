import { useParams, useSearchParams } from "react-router-dom";
import { EditorTopBar } from "./EditorTopBar";
import {
  useGetCampaignContent,
  useUpdateCampaignContent,
} from "../queries/campaign-content-queries";
import { EditorBottomBar } from "./EditorBottomBar";
import { useIntl } from "react-intl";
import { useAppServices } from "./AppServicesContext";
import { LoadingScreen } from "./LoadingScreen";

export const errorMessageTestId = "error-message";
export const editorTopBarTestId = "editor-top-bar-message";

export const Campaign = () => {
  const { idCampaign } = useParams() as Readonly<{
    idCampaign: string;
  }>;

  const {
    appConfiguration: { dopplerLegacyBaseUrl, dopplerExternalUrls },
  } = useAppServices();

  const [searchParams] = useSearchParams();
  const campaignContentQuery = useGetCampaignContent(idCampaign);
  const campaignContentMutation = useUpdateCampaignContent();
  const intl = useIntl();

  const save = () => {
    campaignContentMutation.mutate({
      idCampaign,
      content: { htmlContent: "string", previewImage: "string", type: "html" },
    });
  };

  if (campaignContentQuery.error) {
    return (
      <div data-testid={errorMessageTestId}>
        Unexpected Error:{" "}
        <pre>{JSON.stringify(campaignContentQuery.error)}</pre>
      </div>
    );
  }

  const redirectedFromSummary =
    searchParams.get("redirectedFromSummary")?.toUpperCase() === "TRUE";

  const idABTest = searchParams.get("idABTest");
  const fixedIdCampaign = idABTest ? idABTest : idCampaign;
  const testABIndexSegment = idABTest ? "TestAB" : "Index";

  const nextUrl = redirectedFromSummary
    ? `${dopplerLegacyBaseUrl}/Campaigns/Summary/${testABIndexSegment}?IdCampaign=${fixedIdCampaign}`
    : `${dopplerLegacyBaseUrl}/Campaigns/Recipients/${testABIndexSegment}?IdCampaign=${fixedIdCampaign}` +
      `&RedirectedFromSummary=False&RedirectedFromTemplateList=False`;

  const exitUrl = dopplerExternalUrls.campaigns;

  return (
    <>
      {campaignContentQuery.isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <EditorTopBar
            data-testid={editorTopBarTestId}
            onSave={save}
            title={intl.formatMessage({ id: "campaign_title" }, { idCampaign })}
          />
          <EditorBottomBar
            nextUrl={nextUrl}
            exitUrl={exitUrl}
          ></EditorBottomBar>
        </>
      )}
    </>
  );
};
