import type { Doc, Id } from "@/convex/_generated/dataModel";
import { formatMoney } from "@/lib/currency";

export type GroupMemberAvatar = {
  id: string;
  initials?: string;
  imageUri?: string;
  backgroundColor?: string;
};

export type GroupBalanceTone = "positive" | "negative" | "neutral";

export type GroupCardData = {
  id: Id<"groups">;
  name: string;
  currency: string;
  members: GroupMemberAvatar[];
  balanceLabel: string;
  amount: string;
  tone: GroupBalanceTone;
};

export type GroupMember = {
  id: Id<"users">;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type GroupCardProps = {
  group: GroupCardData;
  onPress: (groupId: Id<"groups">) => void;
  onAddExpense?: (groupId: Id<"groups">) => void;
  onMore?: (groupId: Id<"groups">) => void;
};

export type GroupAvatarStackProps = {
  members: GroupMemberAvatar[];
  maxVisible?: number;
  size?: number;
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
  currency: string;
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

export const avatarsToStack = (
  avatarUrls: string[],
  fallbackName: string,
  keyPrefix: string,
): GroupMemberAvatar[] => {
  if (avatarUrls.length > 0) {
    return avatarUrls.map((imageUri, index) => ({
      id: `${keyPrefix}-avatar-${index}`,
      imageUri,
    }));
  }

  return [
    {
      id: `${keyPrefix}-fallback`,
      initials: fallbackName.trim().charAt(0).toUpperCase() || "G",
      backgroundColor: "#4EA085",
    },
  ];
};

export const membersToStack = (members: GroupMember[]): GroupMemberAvatar[] =>
  members.map((member) => ({
    id: member.id,
    imageUri: member.avatarUrl,
    initials: member.name.trim().charAt(0).toUpperCase() || "?",
    backgroundColor: "#4EA085",
  }));

// Balances are zeroed for now: they will be computed server-side in a future update.
export const mapGroupToCard = (group: Doc<"groups">): GroupCardData => ({
  id: group._id,
  name: group.name,
  currency: group.currency,
  members: avatarsToStack(group.avatarUrls, group.name, group._id),
  balanceLabel: "You are owed",
  amount: formatMoney(0, group.currency, { trimWhole: true }),
  tone: "neutral",
});

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
