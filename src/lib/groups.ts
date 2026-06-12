import type { Id } from "@/convex/_generated/dataModel";

export type GroupListItem = {
  _id: Id<"groups">;
  name: string;
  description?: string;
  avatarUrls: string[];
  memberCount: number;
};

export type GroupMemberAvatar = {
  id: string;
  initials?: string;
  imageUri?: string;
  backgroundColor?: string;
};

export type GroupCardData = {
  id: Id<"groups">;
  name: string;
  members: GroupMemberAvatar[];
  balanceLabel: string;
  amount: string;
  tone: GroupBalanceTone;
};

export type GroupBalanceTone = "positive" | "negative" | "neutral";

export type GroupCardProps = {
  group: GroupCardData;
  onPress: (groupId: Id<"groups">) => void;
  onAddExpense?: (groupId: Id<"groups">) => void;
  onMore?: (groupId: Id<"groups">) => void;
};

export type GroupAvatarStackProps = {
  members: GroupMemberAvatar[];
  maxVisible?: number;
};

export type GroupBalanceProps = {
  label: string;
  amount: string;
  tone?: GroupBalanceTone;
};

export type GroupActionProps = {
  onPress?: () => void;
};

export type CreateGroupInput = {
  name: string;
  description?: string;
};

export type AddGroupMembersInput = {
  groupId: Id<"groups">;
  memberEmails: string[];
};

export type AddGroupMembersResult = {
  missingEmails: string[];
};

export type CreateGroupSheetProps = {
  onClose: () => void;
  onCreateGroup: (input: CreateGroupInput) => Promise<Id<"groups">>;
  onAddMembers: (input: AddGroupMembersInput) => Promise<AddGroupMembersResult>;
  onCheckMemberEmail: (email: string) => Promise<boolean>;
};

export const mapGroupToCard = (group: GroupListItem): GroupCardData => {
  const members =
    group.avatarUrls.length > 0
      ? group.avatarUrls.map((imageUri, index) => ({
          id: `${group._id}-member-${index}`,
          imageUri,
        }))
      : [
          {
            id: `${group._id}-fallback`,
            initials: group.name.trim().charAt(0).toUpperCase() || "G",
            backgroundColor: "#4EA085",
          },
        ];

  return {
    id: group._id,
    name: group.name,
    members,
    balanceLabel: "You are owed",
    amount: "$0",
    tone: "neutral",
  };
};

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
