import { Image } from "expo-image";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { cn } from "@/lib/utils";

type AuthButtonProps = {
  provider: "apple" | "google";
  className?: string;
  onPress?: () => void | Promise<void>;
  loading?: boolean;
};

export function AuthButton({ provider, className, onPress, loading = false }: AuthButtonProps) {
  const isApple = provider === "apple";

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className={cn(
        "rounded-full overflow-hidden",
        isApple ? "bg-black" : "bg-background border-[1.5px] border-border",
        loading && "opacity-80",
        className,
      )}
      style={({ pressed }) => ({
        transform: [{ scale: pressed && !loading ? 0.98 : 1 }],
        opacity: pressed && !loading ? 0.9 : 1,
      })}
    >
      <View className="flex-row items-center justify-center w-full py-4 gap-3">
        {loading ? (
          <ActivityIndicator color={isApple ? "#A1A1AA" : "#71717A"} />
        ) : (
          <Image
            source={
              isApple ? require("@/assets/images/apple.png") : require("@/assets/images/google.png")
            }
            style={{ width: 20, height: 20 }}
            contentFit="contain"
          />
        )}

        <Text
          className={cn(
            "font-[Lato] text-[17px] font-semibold",
            loading
              ? isApple
                ? "text-zinc-400"
                : "text-zinc-500"
              : isApple
                ? "text-white"
                : "text-foreground",
          )}
        >
          {loading
            ? `Redirecting to ${isApple ? "Apple" : "Google"}`
            : `Continue with ${isApple ? "Apple" : "Google"}`}
        </Text>
      </View>
    </Pressable>
  );
}
