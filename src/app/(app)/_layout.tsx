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
              element: <Text className="text-3xl font-bold font-[Inter]">Groups</Text>,
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
    </Stack>
  );
}
