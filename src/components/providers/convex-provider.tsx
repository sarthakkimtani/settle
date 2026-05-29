import { useAuth } from "@clerk/expo";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

export const ConvexProvider = ({
  children,
  client,
}: {
  children: ReactNode;
  client: ConvexReactClient;
}) => {
  const { sessionId } = useAuth();

  return (
    <ConvexProviderWithClerk key={sessionId ?? "signed-out"} client={client} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
};
