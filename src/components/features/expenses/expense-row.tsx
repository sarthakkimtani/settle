import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import type { ActivityRowData, ExpenseShareTone } from "@/lib/expenses";

const toneColor: Record<ExpenseShareTone, string> = {
  lent: "#3E9479",
  borrowed: "#D9531E",
  neutral: "#6B7280",
};

export const ExpenseRow = ({ row }: { row: ActivityRowData }) => (
  <View className="flex-row items-center gap-3 px-4 py-3">
    <View
      className="h-11 w-11 items-center justify-center rounded-full"
      style={{ backgroundColor: row.iconBackground }}
    >
      <Ionicons name={row.icon} size={20} color={row.iconColor} />
    </View>

    <View className="flex-1">
      <Text numberOfLines={1} className="font-[Inter] text-[16px] font-semibold text-foreground">
        {row.title}
      </Text>
      <Text numberOfLines={1} className="mt-0.5 font-[Lato] text-[13px] text-foreground/50">
        {row.subtitle}
      </Text>
    </View>

    <View className="items-end">
      <Text className="font-[Lato] text-[12px]" style={{ color: toneColor[row.tone] }}>
        {row.rightLabel}
      </Text>
      <Text className="font-[Inter] text-[16px] font-bold" style={{ color: toneColor[row.tone] }}>
        {row.rightAmount}
      </Text>
    </View>
  </View>
);
