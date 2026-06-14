import Ionicons from "@expo/vector-icons/Ionicons";
import { useConvex, useMutation, useQuery } from "convex/react";
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

import { GroupAvatarStack } from "@/components/features/groups/group-avatar-stack";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { GroupMember } from "@/lib/groups";
import { isValidEmail, membersToStack } from "@/lib/groups";
import { cn } from "@/lib/utils";

type EditGroupSheetProps = {
  groupId: Id<"groups">;
  onClose: () => void;
  onDeleted?: () => void;
};

export const EditGroupSheet = ({ groupId, onClose, onDeleted }: EditGroupSheetProps) => {
  const details = useQuery(api.groups.getGroupDetails, { groupId });

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "formSheet" : "fullScreen"}
      onRequestClose={onClose}
    >
      {details === undefined ? (
        <View className="flex-1 items-center justify-center bg-card">
          <ActivityIndicator size="large" color="#4EA085" />
        </View>
      ) : (
        <EditGroupForm
          groupId={groupId}
          details={details}
          onClose={onClose}
          onDeleted={onDeleted}
        />
      )}
    </Modal>
  );
};

type EditGroupFormProps = EditGroupSheetProps & {
  details: NonNullable<ReturnType<typeof useQuery<typeof api.groups.getGroupDetails>>>;
};

const EditGroupForm = ({ groupId, details, onClose, onDeleted }: EditGroupFormProps) => {
  const convex = useConvex();
  const updateGroup = useMutation(api.groups.updateGroup);
  const deleteGroup = useMutation(api.groups.deleteGroup);
  const addGroupMembers = useMutation(api.groupMembers.addGroupMembers);
  const removeGroupMembers = useMutation(api.groupMembers.removeGroupMembers);

  const [name, setName] = useState(details.group.name);
  const [description, setDescription] = useState(details.group.description ?? "");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<Id<"users"> | null>(null);

  const isBusy = isSaving || isAddingMember || removingMemberId !== null;

  const save = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      setIsSaving(true);
      await updateGroup({
        groupId,
        name: trimmedName,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update group", error);
      Alert.alert("Group not updated", "Only group admins can edit this group.");
    } finally {
      setIsSaving(false);
    }
  };

  const addMember = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    if (!isValidEmail(normalizedEmail)) {
      Alert.alert("Invalid email", "Enter a complete email address.");
      return;
    }

    try {
      setIsAddingMember(true);
      const { exists } = await convex.query(api.users.checkMemberEmailExists, {
        email: normalizedEmail,
      });
      if (!exists) {
        Alert.alert("Account not found", `${normalizedEmail} does not have a Settle account yet.`);
        return;
      }
      await addGroupMembers({ groupId, memberEmails: [normalizedEmail] });
      setEmail("");
    } catch (error) {
      console.error("Failed to add group member", error);
      Alert.alert("Member not added", "Only group admins can add members.");
    } finally {
      setIsAddingMember(false);
    }
  };

  const removeMember = (member: GroupMember) => {
    Alert.alert("Remove member?", `${member.name} will be removed from this group.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            setRemovingMemberId(member.id);
            await removeGroupMembers({ groupId, memberEmails: [member.email] });
          } catch (error) {
            console.error("Failed to remove group member", error);
            Alert.alert("Member not removed", "Only group admins can remove members.");
          } finally {
            setRemovingMemberId(null);
          }
        },
      },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete group?",
      "All expenses in this group will be lost. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Unmount the subscribers of getGroupDetails (this sheet and, when
            // opened from the detail screen, the detail screen itself) BEFORE the
            // delete lands. Otherwise the reactive query re-runs against the
            // now-missing group and throws "Group not found".
            onClose();
            onDeleted?.();
            deleteGroup({ groupId }).catch((error) => {
              console.error("Failed to delete group", error);
              Alert.alert("Group not deleted", "Only the group creator can delete this group.");
            });
          },
        },
      ],
    );
  };

  const canSave = name.trim().length > 0 && !isBusy;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-card"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-6 px-6 pb-8 pt-5"
      >
        <View className="flex-row items-center justify-between">
          <Text className="font-[Inter] text-2xl font-bold text-foreground">Edit group</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close group editing"
            disabled={isBusy}
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full border border-border"
          >
            <Ionicons name="close" size={22} color="#111827" />
          </Pressable>
        </View>

        <View className="gap-2">
          <Text className="font-[Lato] text-sm font-bold text-foreground/60">Group name</Text>
          <TextInput
            value={name}
            editable={!isBusy}
            maxLength={60}
            onChangeText={setName}
            placeholder="Weekend trip"
            placeholderTextColor="#9CA3AF"
            className="rounded-2xl border border-border bg-background px-4 py-4 font-[Lato] text-base leading-0 text-foreground"
          />
        </View>

        <View className="gap-2">
          <Text className="font-[Lato] text-sm font-bold text-foreground/60">Description</Text>
          <TextInput
            value={description}
            editable={!isBusy}
            multiline
            maxLength={160}
            onChangeText={setDescription}
            placeholder="What is this group for? (optional)"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
            className="min-h-28 rounded-2xl border border-border bg-background px-4 py-4 font-[Lato] text-base leading-0 text-foreground"
          />
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-[Lato] text-sm font-bold text-foreground/60">Members</Text>
            <GroupAvatarStack members={membersToStack(details.members)} size={28} />
          </View>

          {details.members.map((member) => {
            const isCreator = member.id === details.group.createdBy;
            const isRemoving = removingMemberId === member.id;
            return (
              <View
                key={member.id}
                className="flex-row items-center justify-between rounded-2xl bg-surface px-4 py-3"
              >
                <View className="mr-3 flex-1">
                  <Text numberOfLines={1} className="font-[Lato] text-base text-foreground">
                    {member.name || member.email}
                    {member.id === details.currentUserId ? " (you)" : ""}
                  </Text>
                  <Text numberOfLines={1} className="font-[Lato] text-sm text-foreground/50">
                    {isCreator ? `${member.email} · admin` : member.email}
                  </Text>
                </View>
                {isCreator ? null : isRemoving ? (
                  <ActivityIndicator size="small" color="#6B7280" />
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${member.name}`}
                    disabled={isBusy}
                    onPress={() => removeMember(member)}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={18} color="#6B7280" />
                  </Pressable>
                )}
              </View>
            );
          })}

          <View className="flex-row gap-2">
            <TextInput
              value={email}
              editable={!isBusy}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              onSubmitEditing={() => void addMember()}
              placeholder="friend@example.com"
              placeholderTextColor="#9CA3AF"
              returnKeyType="done"
              className="flex-1 rounded-2xl border border-border bg-background px-4 py-4 font-[Lato] text-base leading-0 text-foreground"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add member email"
              onPress={() => void addMember()}
              disabled={!email.trim() || isBusy}
              className="h-14 w-14 items-center justify-center rounded-2xl bg-surface"
            >
              {isAddingMember ? (
                <ActivityIndicator size="small" color="#3E9479" />
              ) : (
                <Ionicons name="add" size={26} color="#3E9479" />
              )}
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!canSave}
          onPress={() => void save()}
          className={cn("rounded-full py-4", canSave ? "bg-primary" : "bg-border")}
        >
          <Text
            className={cn(
              "text-center font-[Lato] text-base font-bold",
              canSave ? "text-white" : "text-foreground/35",
            )}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={confirmDelete}
          className="py-2"
        >
          <Text className="text-center font-[Lato] text-base font-bold text-[#D9531E]">
            Delete group
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
