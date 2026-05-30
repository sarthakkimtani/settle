import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { AccountSheet } from "@/components/features/auth/account-sheet";

import { getUserInitials } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const UserAvatar = () => {
  const { isLoaded, user } = useUser();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const displayName = user?.fullName ?? user?.firstName;
  const initials = getUserInitials(displayName);
  const imageSource = user?.imageUrl && !imageFailed ? user.imageUrl : null;

  useEffect(() => {
    setImageFailed(false);
  }, [user?.imageUrl]);

  const handlePress = () => {
    if (!isLoaded || !user) return;
    setIsSheetOpen(true);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Manage ${displayName}`}
        disabled={!isLoaded}
        onPress={handlePress}
        className={cn(
          "h-10 w-10 items-center justify-center overflow-hidden rounded-full",
          !isLoaded && "opacity-70",
        )}
        style={({ pressed }) => ({
          transform: [{ scale: pressed && isLoaded ? 0.96 : 1 }],
          shadowColor: "#111827",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 5,
        })}
      >
        {!isLoaded ? (
          <ActivityIndicator color="#4EA085" size="small" />
        ) : imageSource ? (
          <Image
            source={{ uri: imageSource }}
            style={{ width: 44, height: 44 }}
            contentFit="cover"
            transition={150}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View className="h-11 w-11 items-center justify-center bg-primary">
            <Text className="font-[Inter] text-sm font-bold text-white">{initials}</Text>
          </View>
        )}
      </Pressable>
      <AccountSheet
        key={user?.id}
        visible={isSheetOpen}
        user={user}
        onClose={() => setIsSheetOpen(false)}
      />
    </>
  );
};
