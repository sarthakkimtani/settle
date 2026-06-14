import type Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";

export type ExpenseCategory = {
  id: string;
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  color: string;
  backgroundColor: string;
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: "groceries", label: "Groceries", icon: "cart", color: "#B45309", backgroundColor: "#FDEBD2" },
  { id: "dining", label: "Dining", icon: "restaurant", color: "#7C3AED", backgroundColor: "#EDE4FD" },
  { id: "drinks", label: "Drinks", icon: "wine", color: "#9F1239", backgroundColor: "#FCE0E6" },
  { id: "transport", label: "Transport", icon: "car", color: "#1D4ED8", backgroundColor: "#DEE9FD" },
  { id: "entertainment", label: "Entertainment", icon: "film", color: "#B91C1C", backgroundColor: "#FDE2E0" },
  { id: "rent", label: "Rent", icon: "home", color: "#0F766E", backgroundColor: "#D8F1EC" },
  { id: "shopping", label: "Shopping", icon: "bag-handle", color: "#BE185D", backgroundColor: "#FBE0EC" },
  { id: "travel", label: "Travel", icon: "airplane", color: "#C2410C", backgroundColor: "#FDE8D8" },
  { id: "other", label: "Other", icon: "receipt", color: "#374151", backgroundColor: "#E8EAEE" },
];

const FALLBACK_CATEGORY = EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];

export const getCategory = (id?: string | null): ExpenseCategory =>
  EXPENSE_CATEGORIES.find((category) => category.id === id) ?? FALLBACK_CATEGORY;
