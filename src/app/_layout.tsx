import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { ConvexReactClient } from "convex/react";
import * as SplashScreen from "expo-splash-screen";

import AppLayout from "@/components/layout/app-layout";
import { ConvexProvider } from "@/components/providers/convex-provider";
import "../global.css";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true });

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL as string);
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ConvexProvider client={convex}>
        <AppLayout />
      </ConvexProvider>
    </ClerkProvider>
  );
}
