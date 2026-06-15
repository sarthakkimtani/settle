import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { AddExpenseSheet } from "@/components/features/expenses/add-expense-sheet";
import { ExpenseSections } from "@/components/features/expenses/expense-sections";
import { SettleUpSheet } from "@/components/features/expenses/settle-up-sheet";
import { EditGroupSheet } from "@/components/features/groups/edit-group-sheet";
import { FloatingAddButton } from "@/components/features/groups/floating-add-button";
import { GroupActionChips } from "@/components/features/groups/group-action-chips";
import { GroupAvatarStack } from "@/components/features/groups/group-avatar-stack";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { describeNetBalanceSentence } from "@/lib/balances";
import {
  buildActivitySections,
  mapExpenseToRow,
  mapSettlementToRow,
  type ExpenseSortOrder,
} from "@/lib/expenses";
import { membersToStack } from "@/lib/groups";

export const GroupDetailsScreen = () => {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: Id<"groups"> }>();

  const details = useQuery(api.groups.getGroupDetails, { groupId });
  const expenses = useQuery(api.expenses.listGroupExpenses, { groupId });
  const settlements = useQuery(api.settlements.listGroupSettlements, { groupId });

  const [sortOrder, setSortOrder] = useState<ExpenseSortOrder>("latest");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);

  if (details === undefined || expenses === undefined || settlements === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#4EA085" />
      </View>
    );
  }

  const rowContext = {
    currentUserId: details.currentUserId,
    memberCount: details.group.memberCount,
    currency: details.group.currency,
  };
  const rows = [
    ...expenses.map((expense) => mapExpenseToRow(expense, rowContext)),
    ...settlements.map((settlement) => mapSettlementToRow(settlement, rowContext)),
  ];
  const sections = buildActivitySections(rows, sortOrder);

  const overallLabel = describeNetBalanceSentence(details.balanceMinor, details.group.currency);

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-4 px-5 pb-32"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-2.5">
            <GroupAvatarStack members={membersToStack(details.members)} maxVisible={3} size={34} />
            <Text
              numberOfLines={1}
              className="flex-1 font-[Inter] text-[28px] font-bold tracking-[-0.5px] text-foreground"
            >
              {details.group.name}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit group"
            onPress={() => setIsEditOpen(true)}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Text className="font-[Lato] text-[17px] text-foreground">Edit</Text>
          </Pressable>
        </View>

        <Text className="font-[Lato] text-[16px] text-foreground">{overallLabel}</Text>

        <GroupActionChips
          onSettleUp={() => setIsSettleUpOpen(true)}
          onCharts={() => router.push(`/groups/${groupId}/charts`)}
        />

        {sections.length === 0 ? (
          <View className="items-center rounded-[24px] bg-card px-8 py-12">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-surface">
              <Ionicons name="receipt-outline" size={28} color="#4EA085" />
            </View>
            <Text className="font-[Inter] text-lg font-bold text-foreground">No expenses yet</Text>
            <Text className="mt-1.5 text-center font-[Lato] text-sm leading-5 text-foreground/55">
              Add the first expense to start splitting with this group.
            </Text>
          </View>
        ) : (
          <ExpenseSections
            sections={sections}
            sortOrder={sortOrder}
            onToggleSortOrder={() =>
              setSortOrder((order) => (order === "latest" ? "oldest" : "latest"))
            }
          />
        )}
      </ScrollView>

      <FloatingAddButton
        accessibilityLabel="Add expense"
        onPress={() => setIsAddExpenseOpen(true)}
      />

      {isAddExpenseOpen ? (
        <AddExpenseSheet groupId={groupId} onClose={() => setIsAddExpenseOpen(false)} />
      ) : null}

      {isSettleUpOpen ? (
        <SettleUpSheet groupId={groupId} onClose={() => setIsSettleUpOpen(false)} />
      ) : null}

      {isEditOpen ? (
        <EditGroupSheet
          groupId={groupId}
          onClose={() => setIsEditOpen(false)}
          onDeleted={() => router.back()}
        />
      ) : null}
    </View>
  );
};
