import { useLayoutEffect } from "react";
import { useAppServices } from ".";

export const NavigateToExternalUrl = ({ to }: { to: string }) => {
  const {
    window: { location },
  } = useAppServices();
  useLayoutEffect(() => {
    location.href = to;
  }, [to, location]);
  return <></>;
};
