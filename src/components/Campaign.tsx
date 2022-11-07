import { useParams } from "react-router-dom";
import { EditorTopBar } from "./EditorTopBar";
import {
  useGetCampaignContent,
  useUpdateCampaignContent,
} from "../queries/campaign-content-queries";
import { EditorBottomBar } from "./EditorBottomBar";
import { useIntl } from "react-intl";
import { useAppServices } from "./application";
import { LoadingScreen } from "./application/LoadingScreen";
import { useRef } from "react";

export const errorMessageTestId = "error-message";
export const editorTopBarTestId = "editor-top-bar-message";

export const Campaign = () => {
  const { idCampaign } = useParams() as Readonly<{
    idCampaign: string;
  }>;

  const {
    appConfiguration: { dopplerExternalUrls },
  } = useAppServices();

  const campaignContentQuery = useGetCampaignContent(idCampaign);
  const campaignContentMutation = useUpdateCampaignContent();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const intl = useIntl();

  const save = () => {
    campaignContentMutation.mutate({
      idCampaign,
      content: JSON.parse(textAreaRef.current?.value || ""),
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
          <textarea
            ref={textAreaRef}
            defaultValue={JSON.stringify(campaignContentQuery.data)}
          />
          <EditorBottomBar
            nextUrl={exitUrl}
            exitUrl={exitUrl}
          ></EditorBottomBar>
        </>
      )}
    </>
  );
};
