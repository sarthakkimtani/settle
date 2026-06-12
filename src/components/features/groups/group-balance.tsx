import { Text, View } from "react-native";

import type { GroupBalanceProps, GroupBalanceTone } from "@/lib/groups";

const toneClasses: Record<GroupBalanceTone, string> = {
  positive: "text-foreground",
  negative: "text-[#D94A16]",
  neutral: "text-foreground",
};

export const GroupBalance = ({ label, amount, tone = "positive" }: GroupBalanceProps) => (
  <View>
    <Text
      className={`font-[Lato] text-[13px] leading-[18px] ${
        tone === "negative" ? "text-[#C84317]" : "text-foreground"
      }`}
    >
      {label}
    </Text>
    <Text className={`font-[Inter] text-[25px] font-bold leading-7 ${toneClasses[tone]}`}>
      {amount}
    </Text>
  </View>
);
