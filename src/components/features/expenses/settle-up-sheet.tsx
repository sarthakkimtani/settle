import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { GroupAvatarStack } from "@/components/features/groups/group-avatar-stack";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";

export const SettleUpSheet = ({
  groupId,
  onClose,
}: {
  groupId: Id<"groups">;
  onClose: () => void;
}) => {
  const data = useQuery(api.settlements.getSettleUp, { groupId });
  const createSettlement = useMutation(api.settlements.createSettlement);

  const [savingUserId, setSavingUserId] = useState<Id<"users"> | null>(null);

  const settle = async (debt: NonNullable<typeof data>["debts"][number]) => {
    if (!data) return;
    const oweOther = debt.direction === "owe";
    try {
      setSavingUserId(debt.otherUserId);
      await createSettlement({
        groupId,
        fromUserId: oweOther ? data.currentUserId : debt.otherUserId,
        toUserId: oweOther ? debt.otherUserId : data.currentUserId,
        amountMinor: debt.amountMinor,
      });
    } catch (error) {
      console.error("Failed to record settlement", error);
      Alert.alert("Not settled", "We couldn't record this payment. Please try again.");
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "formSheet" : "fullScreen"}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-card">
        <View className="flex-row items-center justify-between px-5 pb-2 pt-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close settle up"
            onPress={onClose}
            hitSlop={8}
          >
            <Ionicons name="close" size={26} color="#3E9479" />
          </Pressable>
          <Text className="font-[Inter] text-[17px] font-bold text-foreground">Settle up</Text>
          <View className="w-[26px]" />
        </View>

        {data === undefined ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4EA085" />
          </View>
        ) : data.debts.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10 pb-16">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-surface">
              <Ionicons name="checkmark-done" size={28} color="#4EA085" />
            </View>
            <Text className="font-[Inter] text-lg font-bold text-foreground">
              You&apos;re all settled up
            </Text>
            <Text className="mt-1.5 text-center font-[Lato] text-sm leading-5 text-foreground/55">
              No outstanding balances with anyone in this group.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerClassName="gap-3 px-5 pb-8 pt-4">
            {data.debts.map((debt) => {
              const oweOther = debt.direction === "owe";
              const isSaving = savingUserId === debt.otherUserId;
              return (
                <View
                  key={debt.otherUserId}
                  className="flex-row items-center gap-3 rounded-[20px] border border-border bg-background px-4 py-3.5"
                >
                  <GroupAvatarStack
                    members={[
                      {
                        id: debt.otherUserId,
                        imageUri: debt.otherUserAvatarUrl,
                        initials: debt.otherUserName.trim().charAt(0).toUpperCase() || "?",
                        backgroundColor: "#4EA085",
                      },
                    ]}
                    maxVisible={1}
                    size={40}
                  />
                  <View className="flex-1">
                    <Text
                      numberOfLines={1}
                      className="font-[Inter] text-[15px] font-semibold text-foreground"
                    >
                      {oweOther ? `You owe ${debt.otherUserName}` : `${debt.otherUserName} owes you`}
                    </Text>
                    <Text
                      className="mt-0.5 font-[Inter] text-[18px] font-bold"
                      style={{ color: oweOther ? "#D9531E" : "#3E9479" }}
                    >
                      {formatMoney(debt.amountMinor, data.currency)}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={oweOther ? "Mark paid" : "Mark received"}
                    disabled={isSaving}
                    onPress={() => void settle(debt)}
                    className={cn(
                      "rounded-xl px-3.5 py-2.5",
                      isSaving ? "bg-primary/60" : "bg-primary",
                    )}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text className="font-[Lato] text-[14px] font-bold text-white">
                        {oweOther ? "Mark paid" : "Mark received"}
                      </Text>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};
