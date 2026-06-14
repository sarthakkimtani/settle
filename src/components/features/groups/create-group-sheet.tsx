import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import type { Id } from "@/convex/_generated/dataModel";
import { CurrencyPicker } from "@/components/features/groups/currency-picker";
import { DEFAULT_CURRENCY_CODE } from "@/lib/currency";
import type { CreateGroupSheetProps } from "@/lib/groups";
import { isValidEmail } from "@/lib/groups";
import { cn } from "@/lib/utils";

export const CreateGroupSheet = ({
  onClose,
  onCreateGroup,
  onAddMembers,
  onCheckMemberEmail,
}: CreateGroupSheetProps) => {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY_CODE);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [createdGroupId, setCreatedGroupId] = useState<Id<"groups"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const checkEmail = async () => {
    if (isCheckingEmail) return null;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return null;

    if (!isValidEmail(normalizedEmail)) {
      Alert.alert("Invalid email", "Enter a complete email address.");
      return null;
    }

    try {
      setIsCheckingEmail(true);
      const exists = await onCheckMemberEmail(normalizedEmail);
      if (!exists) {
        Alert.alert(
          "Account not found",
          `${normalizedEmail} does not have a Settle account yet.`,
        );
        return null;
      }
      return normalizedEmail;
    } catch (error) {
      console.error("Failed to check member email", error);
      Alert.alert("Email not checked", "We couldn't verify this account. Please try again.");
      return null;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const addEmail = async () => {
    const normalizedEmail = await checkEmail();
    if (!normalizedEmail) return;

    if (!memberEmails.includes(normalizedEmail)) {
      setMemberEmails([...memberEmails, normalizedEmail]);
    }
    setEmail("");
  };

  const createGroup = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      setIsSubmitting(true);
      const groupId = await onCreateGroup({
        name: trimmedName,
        currency,
        description: description.trim() || undefined,
      });
      setCreatedGroupId(groupId);
    } catch (error) {
      console.error("Failed to create group", error);
      Alert.alert("Group not created", "We couldn't create this group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finish = async () => {
    if (!createdGroupId) return;

    let emails = memberEmails;
    if (email.trim()) {
      const normalizedEmail = await checkEmail();
      if (!normalizedEmail) return;
      emails = [...new Set([...memberEmails, normalizedEmail])];
    }

    if (emails.length === 0) {
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await onAddMembers({ groupId: createdGroupId, memberEmails: emails });
      if (result.missingEmails.length > 0) {
        Alert.alert(
          "Some members weren't added",
          `No Settle account was found for:\n\n${result.missingEmails.join("\n")}`,
        );
      }
      onClose();
    } catch (error) {
      console.error("Failed to add group members", error);
      Alert.alert("Members not added", "Check the emails and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canContinue = name.trim().length > 0 && !isSubmitting;
  const isMembersStep = createdGroupId !== null;

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "formSheet" : "fullScreen"}
      onRequestClose={isSubmitting ? undefined : onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-card"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-6 px-6 pb-8 pt-5"
        >
          <View className="flex-row items-center justify-between">
            <Text className="font-[Inter] text-2xl font-bold text-foreground">
              {isMembersStep ? "Add members" : "Create group"}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close group creation"
              disabled={isSubmitting}
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full border border-border"
            >
              <Ionicons name="close" size={22} color="#111827" />
            </Pressable>
          </View>

          {isMembersStep ? (
            <>
              <View className="gap-2">
                <Text className="font-[Lato] text-sm font-bold text-foreground/60">
                  Member email
                </Text>
                <View className="flex-row gap-2">
                  <TextInput
                    autoFocus
                    value={email}
                    editable={!isSubmitting && !isCheckingEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    onSubmitEditing={() => void addEmail()}
                    placeholder="friend@example.com"
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="done"
                    className="flex-1 rounded-2xl border border-border bg-background px-4 py-4 font-[Lato] text-base leading-0 text-foreground"
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add member email"
                    onPress={() => void addEmail()}
                    disabled={!email.trim() || isSubmitting || isCheckingEmail}
                    className="h-14 w-14 items-center justify-center rounded-2xl bg-surface"
                  >
                    {isCheckingEmail ? (
                      <ActivityIndicator size="small" color="#3E9479" />
                    ) : (
                      <Ionicons name="add" size={26} color="#3E9479" />
                    )}
                  </Pressable>
                </View>
                <Text className="font-[Lato] text-sm leading-5 text-foreground/50">
                  Members need an existing Settle account.
                </Text>
              </View>

              {memberEmails.length > 0 ? (
                <View className="gap-2">
                  {memberEmails.map((memberEmail) => (
                    <View
                      key={memberEmail}
                      className="flex-row items-center justify-between rounded-2xl bg-surface px-4 py-3"
                    >
                      <Text
                        numberOfLines={1}
                        className="mr-3 flex-1 font-[Lato] text-sm text-foreground"
                      >
                        {memberEmail}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${memberEmail}`}
                        onPress={() =>
                          setMemberEmails(memberEmails.filter((item) => item !== memberEmail))
                        }
                        hitSlop={8}
                      >
                        <Ionicons name="close" size={18} color="#6B7280" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : null}

              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting || isCheckingEmail}
                onPress={() => void finish()}
                className="rounded-full bg-primary py-4"
              >
                <Text className="text-center font-[Lato] text-base font-bold text-white">
                  {isSubmitting ? "Finishing..." : "Finish"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting || isCheckingEmail}
                onPress={onClose}
                className="py-2"
              >
                <Text className="text-center font-[Lato] text-base font-bold text-foreground/50">
                  Skip for now
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <View className="gap-2">
                <Text className="font-[Lato] text-sm font-bold text-foreground/60">Group name</Text>
                <TextInput
                  autoFocus
                  value={name}
                  editable={!isSubmitting}
                  maxLength={60}
                  onChangeText={setName}
                  placeholder="Weekend trip"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="next"
                  className="rounded-2xl border border-border bg-background px-4 py-4 font-[Lato] text-base leading-0 text-foreground"
                />
              </View>
              <View className="gap-2">
                <Text className="font-[Lato] text-sm font-bold text-foreground/60">Currency</Text>
                <CurrencyPicker
                  selectedCode={currency}
                  onSelect={setCurrency}
                  disabled={isSubmitting}
                />
              </View>
              <View className="gap-2">
                <Text className="font-[Lato] text-sm font-bold text-foreground/60">
                  Description
                </Text>
                <TextInput
                  value={description}
                  editable={!isSubmitting}
                  multiline
                  maxLength={160}
                  onChangeText={setDescription}
                  placeholder="What is this group for? (optional)"
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                  className="min-h-28 rounded-2xl border border-border bg-background px-4 py-4 font-[Lato] text-base leading-0 text-foreground"
                />
              </View>
              <Pressable
                accessibilityRole="button"
                disabled={!canContinue}
                onPress={() => void createGroup()}
                className={cn("rounded-full py-4", canContinue ? "bg-primary" : "bg-border")}
              >
                <Text
                  className={cn(
                    "text-center font-[Lato] text-base font-bold",
                    canContinue ? "text-white" : "text-foreground/35",
                  )}
                >
                  {isSubmitting ? "Creating..." : "Continue"}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};
