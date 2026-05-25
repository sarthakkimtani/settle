import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

import AppLayout from "@/components/layout/app-layout";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL as string);
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AppLayout />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
