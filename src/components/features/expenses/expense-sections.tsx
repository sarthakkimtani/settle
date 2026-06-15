import Ionicons from "@expo/vector-icons/Ionicons";
import { Fragment } from "react";
import { Pressable, Text, View } from "react-native";

import { ExpenseRow } from "@/components/features/expenses/expense-row";
import type { ActivitySection, ExpenseSortOrder } from "@/lib/expenses";

type ExpenseSectionsProps = {
  sections: ActivitySection[];
  sortOrder: ExpenseSortOrder;
  onToggleSortOrder: () => void;
};

export const ExpenseSections = ({
  sections,
  sortOrder,
  onToggleSortOrder,
}: ExpenseSectionsProps) => (
  <View className="gap-3">
    {sections.map((section, index) => (
      <View key={section.key} className="rounded-[24px] bg-card py-2" style={sectionShadow}>
        <View className="flex-row items-center justify-between px-4 pb-1 pt-2">
          <Text className="font-[Inter] text-[15px] font-semibold text-foreground">
            {section.title}
          </Text>
          {index === 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Sorted by ${sortOrder}, tap to toggle`}
              onPress={onToggleSortOrder}
              hitSlop={8}
              className="flex-row items-center gap-1"
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Text className="font-[Lato] text-[14px] text-foreground/55">
                {sortOrder === "latest" ? "Latest" : "Oldest"}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#6B7280" />
            </Pressable>
          ) : null}
        </View>

        {section.rows.map((row, rowIndex) => (
          <Fragment key={row.id}>
            {rowIndex > 0 ? <View className="ml-[72px] h-px bg-border/60" /> : null}
            <ExpenseRow row={row} />
          </Fragment>
        ))}
      </View>
    ))}
  </View>
);

const sectionShadow = {
  shadowColor: "#34836E",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 18,
  elevation: 4,
};
