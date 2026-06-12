import Ionicons from "@expo/vector-icons/Ionicons";
import type { GestureResponderEvent } from "react-native";
import { Pressable, Text } from "react-native";

import type { GroupActionProps } from "@/lib/groups";

export const AddExpenseButton = ({ onPress }: GroupActionProps) => {
  const handlePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress?.();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add expense"
      onPress={handlePress}
      hitSlop={8}
      className="flex-row items-center gap-1.5 rounded-full px-1 py-1"
      style={({ pressed }) => ({ opacity: pressed ? 0.58 : 1 })}
    >
      <Ionicons name="add" size={23} color="#3E9479" />
      <Text className="font-[Lato] text-[16px] text-primary">Add expense</Text>
    </Pressable>
  );
};
