export const getUserInitials = (displayName?: string | null) => {
  const normalizedName = displayName?.trim() || "Your account";
  const emailPrefix = normalizedName.includes("@") ? normalizedName.split("@")[0] : normalizedName;
  const words = emailPrefix.split(/[\s._-]+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return initials || "YA";
};
