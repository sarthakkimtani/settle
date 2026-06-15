import Ionicons from "@expo/vector-icons/Ionicons";
import { useConvex, useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";

import { AddExpenseSheet } from "@/components/features/expenses/add-expense-sheet";
import { CreateGroupSheet } from "@/components/features/groups/create-group-sheet";
import { EditGroupSheet } from "@/components/features/groups/edit-group-sheet";
import { FloatingAddButton } from "@/components/features/groups/floating-add-button";
import { GroupCard } from "@/components/features/groups/group-card";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { AddGroupMembersInput, CreateGroupInput, GroupCardData } from "@/lib/groups";
import { mapGroupToCard } from "@/lib/groups";

export const GroupsScreen = () => {
  const router = useRouter();
  const convex = useConvex();
  const groupsResult = useQuery(api.groups.getGroups, {});
  const createGroup = useMutation(api.groups.createGroup);
  const deleteGroup = useMutation(api.groups.deleteGroup);
  const addGroupMembers = useMutation(api.groupMembers.addGroupMembers);

  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [editGroupId, setEditGroupId] = useState<Id<"groups"> | null>(null);
  const [expenseGroupId, setExpenseGroupId] = useState<Id<"groups"> | null>(null);

  const groups = groupsResult?.map(mapGroupToCard) ?? [];

  const handleOpenGroup = (groupId: Id<"groups">) => router.push(`/groups/${groupId}`);

  const handleCreateGroup = async ({ name, currency, description }: CreateGroupInput) => {
    const result = await createGroup({ name, currency, description });
    return result.groupId;
  };

  const handleAddMembers = (input: AddGroupMembersInput) => addGroupMembers(input);

  const handleCheckMemberEmail = async (email: string) => {
    const result = await convex.query(api.users.checkMemberEmailExists, { email });
    return result.exists;
  };

  const confirmDeleteGroup = (group: GroupCardData) => {
    Alert.alert(
      "Delete group?",
      `"${group.name}" and all of its expenses will be lost. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGroup({ groupId: group.id });
            } catch (error) {
              console.error("Failed to delete group", error);
              Alert.alert("Group not deleted", "Only the group creator can delete this group.");
            }
          },
        },
      ],
    );
  };

  const handleMore = (group: GroupCardData) => {
    Alert.alert(group.name, undefined, [
      { text: "Edit group", onPress: () => setEditGroupId(group.id) },
      { text: "Delete group", style: "destructive", onPress: () => confirmDeleteGroup(group) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View className="flex-1 bg-surface">
      {groupsResult === undefined ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4EA085" />
        </View>
      ) : groups.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10 pb-24">
          <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-white/70">
            <Ionicons name="people-outline" size={36} color="#4EA085" />
          </View>
          <Text className="font-[Inter] text-[22px] font-bold text-foreground">No groups yet</Text>
          <Text className="mt-2 text-center font-[Lato] text-base leading-6 text-foreground/55">
            Create a group to start splitting expenses with friends.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsCreateSheetOpen(true)}
            className="mt-6 rounded-full bg-primary px-6 py-3"
          >
            <Text className="font-[Lato] text-base font-bold text-white">Create group</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-3.5 px-5 pb-32 pt-2"
        >
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onPress={handleOpenGroup}
              onAddExpense={setExpenseGroupId}
              onMore={() => handleMore(group)}
            />
          ))}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add group"
            onPress={() => setIsCreateSheetOpen(true)}
            className="self-start rounded-full py-1 pr-4"
            style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}
          >
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="add" size={22} color="#3E9479" />
              <Text className="font-[Lato] text-[18px] text-primary">Add group</Text>
            </View>
          </Pressable>
        </ScrollView>
      )}

      {groups.length > 0 ? (
        <FloatingAddButton
          accessibilityLabel="Create a group"
          onPress={() => setIsCreateSheetOpen(true)}
        />
      ) : null}

      {isCreateSheetOpen ? (
        <CreateGroupSheet
          onClose={() => setIsCreateSheetOpen(false)}
          onCreateGroup={handleCreateGroup}
          onAddMembers={handleAddMembers}
          onCheckMemberEmail={handleCheckMemberEmail}
        />
      ) : null}

      {editGroupId ? (
        <EditGroupSheet groupId={editGroupId} onClose={() => setEditGroupId(null)} />
      ) : null}

      {expenseGroupId ? (
        <AddExpenseSheet groupId={expenseGroupId} onClose={() => setExpenseGroupId(null)} />
      ) : null}
    </View>
  );
};
