import { Image } from "expo-image";
import { Text, useWindowDimensions, View } from "react-native";

import { AuthButton } from "@/components/features/auth/auth-button";

export const AuthScreen = () => {
  const { height } = useWindowDimensions();

  return (
    <View className="flex-1 bg-primary">
      <View className="justify-center items-center px-8" style={{ height: height * 0.55 }}>
        <Image
          source={require("@/assets/icons/splash-icon.png")}
          style={{ width: 80, height: 80, marginBottom: 30 }}
          contentFit="contain"
        />
        <Text className="font-[Inter] text-5xl font-bold text-white tracking-tight mb-3">
          Settle
        </Text>
        <Text className="font-[Lato] text-lg text-white/90 text-center">
          Split expenses with friends,
        </Text>
        <Text className="font-[Lato] text-lg text-white/90 text-center leading-relaxed">
          stress-free.
        </Text>
      </View>
      <View className="flex-1 bg-card rounded-t-[40px] px-8 pt-12 gap-5" style={styles.cardShadow}>
        <View className="flex gap-2">
          <Text className="font-[Inter] text-3xl font-extrabold text-foreground tracking-tight">
            Get Started
          </Text>
          <Text className="font-[Lato] text-base text-foreground/60">
            Sign in or create an account to continue
          </Text>
        </View>
        <AuthButton provider="apple" />
        <AuthButton provider="google" />
        <Text className="font-[Lato] text-xs text-foreground/50 text-center leading-5">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
};

const styles = {
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
};
