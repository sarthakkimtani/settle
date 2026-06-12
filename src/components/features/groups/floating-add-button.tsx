import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable } from "react-native";

import type { GroupActionProps } from "@/lib/groups";

export const FloatingAddButton = ({ onPress }: GroupActionProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel="Create a group"
    onPress={onPress}
    className="absolute bottom-7 left-1/2 h-[65px] w-[65px] items-center justify-center rounded-full bg-primary"
    style={({ pressed }) => [
      buttonShadow,
      {
        marginLeft: -32.5,
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      },
    ]}
  >
    <Ionicons name="add" size={52} color="white" />
  </Pressable>
);

const buttonShadow = {
  shadowColor: "#216A56",
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.24,
  shadowRadius: 18,
  elevation: 10,
};
