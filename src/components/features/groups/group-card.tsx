import Ionicons from "@expo/vector-icons/Ionicons";
import type { GestureResponderEvent } from "react-native";
import { Pressable, Text, View } from "react-native";

import { AddExpenseButton } from "@/components/features/groups/add-expense-button";
import { GroupAvatarStack } from "@/components/features/groups/group-avatar-stack";
import { GroupBalance } from "@/components/features/groups/group-balance";

import type { GroupCardProps } from "@/lib/groups";

export const GroupCard = ({ group, onPress, onAddExpense, onMore }: GroupCardProps) => {
  const handleMorePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onMore?.(group.id);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${group.name}`}
      onPress={() => onPress(group.id)}
      className="min-h-[146px] rounded-[24px] bg-card px-[18px] pb-4 pt-3.5"
      style={({ pressed }) => [
        cardShadow,
        {
          opacity: pressed ? 0.94 : 1,
          transform: [{ scale: pressed ? 0.992 : 1 }],
        },
      ]}
    >
      <View className="flex-row items-start justify-between">
        <GroupAvatarStack members={group.members} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`More options for ${group.name}`}
          onPress={handleMorePress}
          hitSlop={12}
          className="h-8 w-8 items-center justify-center rounded-full"
          style={({ pressed }) => ({ opacity: pressed ? 0.45 : 1 })}
        >
          <Ionicons name="ellipsis-horizontal" size={21} color="#4EA085" />
        </Pressable>
      </View>

      <Text
        numberOfLines={1}
        className="font-[Inter] text-[18px] font-bold leading-6 text-foreground"
      >
        {group.name}
      </Text>

      <View className="mt-auto flex-row items-end justify-between">
        <GroupBalance label={group.balanceLabel} amount={group.amount} tone={group.tone} />
        <AddExpenseButton onPress={() => onAddExpense?.(group.id)} />
      </View>
    </Pressable>
  );
};

const cardShadow = {
  shadowColor: "#34836E",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 18,
  elevation: 4,
};
