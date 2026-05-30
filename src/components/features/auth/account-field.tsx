import { Text, TextInput, View } from "react-native";

export const AccountField = ({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) => {
  return (
    <View className="gap-2">
      <Text className="font-[Lato] text-sm font-bold text-foreground/60 dark:text-zinc-400">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#9CA3AF"
        className="rounded-2xl border-[1.5px] border-border leading-0 bg-background px-4 py-4 font-[Lato] text-base text-foreground"
      />
    </View>
  );
};
