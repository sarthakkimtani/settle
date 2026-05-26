import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { cn } from "@/lib/utils";

type AuthButtonProps = {
  provider: "apple" | "google";
  className?: string;
  onPress?: () => void;
};

export function AuthButton({ provider, className, onPress }: AuthButtonProps) {
  const isApple = provider === "apple";

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "rounded-full overflow-hidden",
        isApple ? "bg-black" : "bg-background border-[1.5px] border-border",
        className,
      )}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View className="flex-row items-center justify-center w-full py-4 gap-3">
        <Image
          source={
            isApple ? require("@/assets/images/apple.png") : require("@/assets/images/google.png")
          }
          style={{ width: 20, height: 20 }}
          contentFit="contain"
        />

        <Text
          className={cn(
            "font-[Inter] text-[17px] font-semibold",
            isApple ? "text-white" : "text-foreground",
          )}
        >
          Continue with {isApple ? "Apple" : "Google"}
        </Text>
      </View>
    </Pressable>
  );
}
