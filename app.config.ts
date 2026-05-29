import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Settle",
  slug: "settle",
  extra: {
    EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID,
    EXPO_PUBLIC_CLERK_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_CLIENT_ID,
    EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME: process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME,
    EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID:
      process.env.EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID,
  },
});
