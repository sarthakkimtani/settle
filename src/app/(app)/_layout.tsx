import { Stack } from "expo-router";
import { Text } from "react-native";

import { UserAvatar } from "@/components/features/auth/user-avatar";

export default function PrivateLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTransparent: true,
          headerTitle: "",
          unstable_headerLeftItems: () => [
            {
              type: "custom",
              hidesSharedBackground: true,
              element: (
                <Text className="font-[Inter] text-[30px] font-bold tracking-[-0.7px] text-foreground">
                  Groups
                </Text>
              ),
            },
          ],
          unstable_headerRightItems: () => [
            {
              type: "custom",
              hidesSharedBackground: true,
              element: <UserAvatar />,
            },
          ],
        }}
      />
      <Stack.Screen
        name="groups/[id]"
        options={{
          headerTransparent: true,
          headerTitle: "",
          headerBackTitle: "Groups",
          headerTintColor: "#111827",
        }}
      />
      <Stack.Screen
        name="groups/[id]/charts"
        options={{
          headerTransparent: true,
          headerTitle: "Charts",
          headerBackTitle: "Back",
          headerTintColor: "#111827",
        }}
      />
    </Stack>
  );
}
