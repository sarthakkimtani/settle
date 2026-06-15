import { Alert, Pressable, ScrollView, Text } from "react-native";

import { cn } from "@/lib/utils";

export const GroupActionChips = ({
  onSettleUp,
  onCharts,
}: {
  onSettleUp: () => void;
  onCharts: () => void;
}) => {
  const actions = [
    { label: "Settle up", primary: true, onPress: onSettleUp },
    { label: "Charts", primary: false, onPress: onCharts },
    { label: "Export", primary: false, onPress: () => Alert.alert("Export", "Coming soon!") },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2.5"
    >
      {actions.map(({ label, primary, onPress }) => (
        <Pressable
          key={label}
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={onPress}
          className={cn(
            "rounded-xl px-4 py-2.5",
            primary ? "bg-primary" : "border border-border bg-card",
          )}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text
            className={cn(
              "font-[Lato] text-[15px] font-medium",
              primary ? "text-white" : "text-foreground",
            )}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
};
