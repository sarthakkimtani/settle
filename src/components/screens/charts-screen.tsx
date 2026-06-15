import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { DonutChart } from "@/components/features/charts/donut-chart";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { buildCategoryChart, buildPersonChart, type ChartSlice } from "@/lib/charts";
import { formatMoney } from "@/lib/currency";

const ChartCard = ({
  title,
  slices,
  currency,
}: {
  title: string;
  slices: ChartSlice[];
  currency: string;
}) => {
  const totalMinor = slices.reduce((sum, slice) => sum + slice.amountMinor, 0);

  return (
    <View className="rounded-[24px] bg-card p-5" style={cardShadow}>
      <Text className="font-[Inter] text-[17px] font-bold text-foreground">{title}</Text>

      <View className="mt-4 items-center">
        <DonutChart
          data={slices.map((slice) => ({
            key: slice.key,
            value: slice.amountMinor,
            color: slice.color,
          }))}
        >
          <Text className="font-[Lato] text-[12px] text-foreground/50">Total</Text>
          <Text className="font-[Inter] text-[20px] font-bold text-foreground">
            {formatMoney(totalMinor, currency, { trimWhole: true })}
          </Text>
        </DonutChart>
      </View>

      <View className="mt-5 gap-3">
        {slices.map((slice) => (
          <View key={slice.key} className="flex-row items-center gap-3">
            <View className="h-3 w-3 rounded-full" style={{ backgroundColor: slice.color }} />
            <Text numberOfLines={1} className="flex-1 font-[Lato] text-[15px] text-foreground">
              {slice.label}
            </Text>
            <Text className="font-[Lato] text-[13px] text-foreground/45">
              {Math.round(slice.percent * 100)}%
            </Text>
            <Text className="w-20 text-right font-[Inter] text-[15px] font-semibold text-foreground">
              {slice.amountLabel}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export const ChartsScreen = () => {
  const { id: groupId } = useLocalSearchParams<{ id: Id<"groups"> }>();
  const details = useQuery(api.groups.getGroupDetails, { groupId });
  const expenses = useQuery(api.expenses.listGroupExpenses, { groupId });

  if (details === undefined || expenses === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#4EA085" />
      </View>
    );
  }

  const currency = details.group.currency;
  const categorySlices = buildCategoryChart(expenses, currency);
  const personSlices = buildPersonChart(expenses, details.members, currency);

  if (categorySlices.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-10">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-white/70">
          <Ionicons name="pie-chart-outline" size={28} color="#4EA085" />
        </View>
        <Text className="font-[Inter] text-lg font-bold text-foreground">Nothing to chart yet</Text>
        <Text className="mt-1.5 text-center font-[Lato] text-sm leading-5 text-foreground/55">
          Add some expenses to see how spending breaks down.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-4 px-5 pb-16 pt-2"
      >
        <ChartCard title="Spending by category" slices={categorySlices} currency={currency} />
        <ChartCard title="Spending by person" slices={personSlices} currency={currency} />
      </ScrollView>
    </View>
  );
};

const cardShadow = {
  shadowColor: "#34836E",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 18,
  elevation: 4,
};
