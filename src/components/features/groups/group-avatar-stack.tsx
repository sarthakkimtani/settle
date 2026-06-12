import { Image } from "expo-image";
import { Text, View } from "react-native";

import type { GroupAvatarStackProps } from "@/lib/groups";

export const GroupAvatarStack = ({ members, maxVisible = 4 }: GroupAvatarStackProps) => {
  const visibleMembers = members.slice(0, maxVisible);

  return (
    <View className="flex-row items-center">
      {visibleMembers.map((member, index) => (
        <View
          key={member.id}
          className="h-10 w-10 overflow-hidden rounded-full border-2 border-white"
          style={{
            marginLeft: index === 0 ? 0 : -11,
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
              <Text className="font-[Inter] text-sm font-semibold text-white">
                {member.initials}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};
