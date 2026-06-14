import { Alert, Pressable, ScrollView, Text } from "react-native";

import { cn } from "@/lib/utils";

const ACTIONS = [
  { label: "Settle up", primary: true },
  { label: "Remind", primary: false },
  { label: "Charts", primary: false },
  { label: "Export", primary: false },
];

export const GroupActionChips = () => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5">
    {ACTIONS.map(({ label, primary }) => (
      <Pressable
        key={label}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => Alert.alert(label, "Coming soon!")}
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
