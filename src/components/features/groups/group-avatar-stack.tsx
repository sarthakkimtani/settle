import { Image } from "expo-image";
import { Text, View } from "react-native";

import type { GroupAvatarStackProps } from "@/lib/groups";

export const GroupAvatarStack = ({ members, maxVisible = 4, size = 40 }: GroupAvatarStackProps) => {
  const visibleMembers = members.slice(0, maxVisible);
  const overlap = Math.round(size * 0.275);

  return (
    <View className="flex-row items-center">
      {visibleMembers.map((member, index) => (
        <View
          key={member.id}
          className="overflow-hidden rounded-full"
          style={{
            width: size,
            height: size,
            marginLeft: index === 0 ? 0 : -overlap,
            zIndex: visibleMembers.length - index,
            backgroundColor: member.backgroundColor ?? "#4EA085",
          }}
        >
          {member.imageUri ? (
            <Image
              source={{ uri: member.imageUri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={120}
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Text
                className="font-[Inter] font-semibold text-white"
                style={{ fontSize: Math.max(11, Math.round(size * 0.35)) }}
              >
                {member.initials}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};
