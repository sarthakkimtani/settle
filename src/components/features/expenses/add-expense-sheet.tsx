import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { GroupAvatarStack } from "@/components/features/groups/group-avatar-stack";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { EXPENSE_CATEGORIES, getCategory } from "@/lib/categories";
import { getCurrency, majorToMinor } from "@/lib/currency";
import { avatarsToStack } from "@/lib/groups";
import { cn } from "@/lib/utils";

/** Keep only a valid, non-negative money string: one decimal point, `decimals` places, capped length. */
const sanitizeAmount = (text: string, decimals: number): string => {
  let cleaned = text.replace(/[^0-9.]/g, "");
  if (decimals === 0) cleaned = cleaned.replace(/\./g, "");
  const dot = cleaned.indexOf(".");
  if (dot !== -1) {
    cleaned = cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./g, "");
  }
  let [intPart, decPart] = cleaned.split(".");
  intPart = intPart.replace(/^0+(?=\d)/, "").slice(0, 9);
  if (decPart === undefined) return intPart;
  if (intPart === "") intPart = "0";
  return `${intPart}.${decPart.slice(0, decimals)}`;
};

export const AddExpenseSheet = ({
  groupId,
  onClose,
}: {
  groupId: Id<"groups">;
  onClose: () => void;
}) => {
  const details = useQuery(api.groups.getGroupDetails, { groupId });
  const createExpense = useMutation(api.expenses.createExpense);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currency = details ? getCurrency(details.group.currency) : null;
  const amountValue = Number.parseFloat(amount) || 0;
  const canSave = details !== undefined && amountValue > 0 && !isSaving;

  const save = async () => {
    if (!details || amountValue <= 0) return;

    try {
      setIsSaving(true);
      await createExpense({
        groupId,
        description: description.trim() || (categoryId ? getCategory(categoryId).label : "Expense"),
        category: categoryId ?? undefined,
        amountMinor: majorToMinor(amountValue, details.group.currency),
        paidByUserId: details.currentUserId,
      });
      onClose();
    } catch (error) {
      console.error("Failed to create expense", error);
      Alert.alert("Expense not saved", "We couldn't save this expense. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const symbol = currency?.symbol ?? "";

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "formSheet" : "fullScreen"}
      onRequestClose={isSaving ? undefined : onClose}
    >
      <View className="flex-1 bg-card">
        <View className="flex-row items-center justify-between px-5 pt-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close add expense"
            disabled={isSaving}
            onPress={onClose}
            hitSlop={8}
          >
            <Ionicons name="close" size={26} color="#3E9479" />
          </Pressable>

          <View className="items-center">
            <Text className="font-[Inter] text-[17px] font-bold text-foreground">Add expense</Text>
            {details ? (
              <View className="mt-1 flex-row items-center gap-1.5">
                <GroupAvatarStack
                  members={avatarsToStack(
                    details.group.avatarUrls,
                    details.group.name,
                    details.group._id,
                  )}
                  maxVisible={2}
                  size={18}
                />
                <Text className="font-[Lato] text-[13px] text-foreground/50">
                  {details.group.name}
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save expense"
            disabled={!canSave}
            onPress={() => void save()}
            hitSlop={8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#3E9479" />
            ) : (
              <Text
                className={cn(
                  "font-[Lato] text-[17px] font-bold",
                  canSave ? "text-primary" : "text-foreground/30",
                )}
              >
                Save
              </Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-6 px-6 pb-4 pt-8"
        >
          <View className="flex-row items-end gap-3">
            <View className="h-[52px] w-[52px] items-center justify-center rounded-xl border border-border bg-background">
              <Text className="font-[Inter] text-[24px] font-semibold text-foreground">
                {symbol || "…"}
              </Text>
            </View>
            <View className="flex-1 border-b-2 border-primary pb-1">
              <TextInput
                value={amount}
                editable={!isSaving}
                autoFocus
                keyboardType="decimal-pad"
                inputMode="decimal"
                onChangeText={(text) => setAmount(sanitizeAmount(text, currency?.decimals ?? 2))}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                className="font-[Inter] text-[44px] font-bold text-foreground"
              />
            </View>
          </View>

          <Text className="font-[Lato] text-[16px] text-primary">
            Paid by you and split equally
          </Text>

          <TextInput
            value={description}
            editable={!isSaving}
            maxLength={80}
            onChangeText={setDescription}
            placeholder="Description"
            placeholderTextColor="#9CA3AF"
            className="border-b border-border pb-3 font-[Lato] text-[17px] leading-0 text-foreground"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="gap-2"
          >
            {EXPENSE_CATEGORIES.map((category) => {
              const isSelected = category.id === categoryId;
              return (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Category ${category.label}`}
                  accessibilityState={{ selected: isSelected }}
                  disabled={isSaving}
                  onPress={() => setCategoryId(isSelected ? null : category.id)}
                  className={cn(
                    "flex-row items-center gap-1.5 rounded-full border px-3.5 py-2",
                    isSelected ? "border-primary bg-primary/10" : "border-border bg-background",
                  )}
                >
                  <Ionicons
                    name={category.icon}
                    size={15}
                    color={isSelected ? "#3E9479" : category.color}
                  />
                  <Text
                    className={cn(
                      "font-[Lato] text-[13px] font-bold",
                      isSelected ? "text-primary" : "text-foreground/70",
                    )}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </ScrollView>
      </View>
    </Modal>
  );
};
