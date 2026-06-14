import { Pressable, ScrollView, Text } from "react-native";

import { CURRENCIES } from "@/lib/currency";
import { cn } from "@/lib/utils";

type CurrencyPickerProps = {
  selectedCode: string;
  onSelect: (code: string) => void;
  disabled?: boolean;
};

export const CurrencyPicker = ({ selectedCode, onSelect, disabled }: CurrencyPickerProps) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
    contentContainerClassName="gap-2"
  >
    {CURRENCIES.map((currency) => {
      const isSelected = currency.code === selectedCode;
      return (
        <Pressable
          key={currency.code}
          accessibilityRole="button"
          accessibilityLabel={`Currency ${currency.name}`}
          accessibilityState={{ selected: isSelected }}
          disabled={disabled}
          onPress={() => onSelect(currency.code)}
          className={cn(
            "flex-row items-center gap-1.5 rounded-full border px-4 py-2.5",
            isSelected ? "border-primary bg-primary" : "border-border bg-background",
          )}
        >
          <Text
            className={cn(
              "font-[Inter] text-sm font-bold",
              isSelected ? "text-white" : "text-foreground/70",
            )}
          >
            {currency.symbol}
          </Text>
          <Text
            className={cn(
              "font-[Lato] text-sm font-bold",
              isSelected ? "text-white" : "text-foreground/70",
            )}
          >
            {currency.code}
          </Text>
        </Pressable>
      );
    })}
  </ScrollView>
);
