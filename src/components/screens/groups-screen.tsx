import Ionicons from "@expo/vector-icons/Ionicons";
import { useConvex, useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { CreateGroupSheet } from "@/components/features/groups/create-group-sheet";
import { FloatingAddButton } from "@/components/features/groups/floating-add-button";
import { GroupCard } from "@/components/features/groups/group-card";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { AddGroupMembersInput, CreateGroupInput } from "@/lib/groups";
import { mapGroupToCard } from "@/lib/groups";

export const GroupsScreen = () => {
  const router = useRouter();
  const convex = useConvex();
  const groupsResult = useQuery(api.groups.getGroups, {});
  const createGroup = useMutation(api.groups.createGroup);
  const addGroupMembers = useMutation(api.groupMembers.addGroupMembers);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  const groups = groupsResult?.map(mapGroupToCard) ?? [];

  const handleOpenGroup = (groupId: Id<"groups">) => router.push(`/groups/${groupId}`);

  const handleCreateGroup = async ({ name, description }: CreateGroupInput) => {
    const result = await createGroup({ name, description });
    return result.groupId;
  };

  const handleAddMembers = (input: AddGroupMembersInput) => addGroupMembers(input);

  const handleCheckMemberEmail = async (email: string) => {
    const result = await convex.query(api.users.checkMemberEmailExists, { email });
    return result.exists;
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
          contentContainerClassName="gap-3.5 px-5 pb-32"
        >
          <Text className="font-[Lato] text-[17px] leading-6 text-foreground">
            Overall, you are owed $0
          </Text>

          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onPress={handleOpenGroup}
              onAddExpense={() => {}}
              onMore={() => {}}
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
        <FloatingAddButton onPress={() => setIsCreateSheetOpen(true)} />
      ) : null}

      {isCreateSheetOpen ? (
        <CreateGroupSheet
          onClose={() => setIsCreateSheetOpen(false)}
          onCreateGroup={handleCreateGroup}
          onAddMembers={handleAddMembers}
          onCheckMemberEmail={handleCheckMemberEmail}
        />
      ) : null}
    </View>
  );
};
