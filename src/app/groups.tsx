import { useAuth } from "@clerk/expo";
import { useState } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";

export default function GroupsScreen() {
  const [loading, setLoading] = useState(false);

  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut({ redirectUrl: "/" });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Hi</Text>
      {loading ? <ActivityIndicator /> : <Button title="Logout" onPress={handleLogout} />}
    </View>
  );
}
