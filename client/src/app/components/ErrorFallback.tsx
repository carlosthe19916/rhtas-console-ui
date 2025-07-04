import { useNavigate } from "react-router-dom";

import { Bullseye, Button, EmptyState, EmptyStateBody, EmptyStateVariant } from "@patternfly/react-core";
import UserNinjaIcon from "@patternfly/react-icons/dist/esm/icons/user-ninja-icon";
import spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";

export const ErrorFallback = ({
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: (...args: unknown[]) => void;
}) => {
  const navigate = useNavigate();

  return (
    <Bullseye>
      <EmptyState
        titleText="Oops! Something went wrong."
        headingLevel="h4"
        icon={UserNinjaIcon}
        variant={EmptyStateVariant.sm}
      >
        <EmptyStateBody>
          Try to refresh your page or contact your admin.
          <Button
            variant="primary"
            className={spacing.mtSm}
            onClick={() => {
              navigate("/");
              resetErrorBoundary(false);
            }}
          >
            Go to home
          </Button>
        </EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
};
