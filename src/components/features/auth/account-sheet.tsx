import { useAuth } from "@clerk/expo";
import type { UserResource } from "@clerk/shared/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from "react-native";

import { AccountField } from "@/components/features/auth/account-field";

import { getUserInitials } from "@/lib/auth";
import { cn } from "@/lib/utils";

type AccountSheetProps = {
  visible: boolean;
  user: UserResource | null | undefined;
  onClose: () => void;
};

export const AccountSheet = ({ visible, user, onClose }: AccountSheetProps) => {
  const { signOut } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const displayName = user?.fullName ?? user?.firstName;
  const initials = getUserInitials(displayName);
  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? "No primary email";
  const imageSource = user?.imageUrl && !imageFailed ? user.imageUrl : null;
  const hasProfileChanges =
    firstName.trim() !== (user?.firstName ?? "") || lastName.trim() !== (user?.lastName ?? "");

  const handleSaveProfile = async () => {
    if (!user || !hasProfileChanges) return;

    try {
      setIsSaving(true);
      await user.update({
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
      });
    } catch (err) {
      console.error("Failed to update profile", err);
      Alert.alert("Profile not saved", "We couldn't save your profile changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.hasImage) return;

    try {
      setIsSaving(true);
      await user.setProfileImage({ file: null });
    } catch (err) {
      console.error("Failed to remove profile image", err);
      Alert.alert("Photo not removed", "We couldn't remove your profile photo. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmRemoveAvatar = () => {
    Alert.alert("Remove profile photo?", "Your initials will be shown instead.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: handleRemoveAvatar },
    ]);
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ redirectUrl: "/auth" });
      onClose();
    } catch (err) {
      console.error("Logout failed", err);
      Alert.alert("Sign out failed", "We couldn't sign you out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert("Sign out?", "You can sign back in any time.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: handleSignOut },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-card gap-6 px-6 pb-8 pt-5"
      >
        <View className="flex-row items-center justify-between">
          <Text className="font-[Inter] text-2xl font-extrabold text-foreground">Account</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close account management"
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full border border-border"
          >
            <Ionicons name="close" size={22} color="black" />
          </Pressable>
        </View>

        <View className="items-center gap-3">
          <View className="h-24 w-24 overflow-hidden rounded-full">
            {imageSource ? (
              <Image
                source={{ uri: imageSource }}
                style={{ width: 96, height: 96 }}
                contentFit="cover"
                transition={150}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <View className="h-24 w-24 items-center justify-center bg-primary">
                <Text className="font-[Inter] text-3xl font-extrabold text-white">{initials}</Text>
              </View>
            )}
          </View>
          <View className="items-center gap-1">
            <Text className="font-[Inter] text-xl font-extrabold text-foreground">
              {displayName}
            </Text>
            <Text className="font-[Lato] text-sm text-foreground/60">{primaryEmail}</Text>
          </View>
          {user?.hasImage ? (
            <Pressable
              accessibilityRole="button"
              onPress={confirmRemoveAvatar}
              disabled={isSaving}
              className="rounded-full bg-surface px-4 py-2"
            >
              <Text className="font-[Lato] text-sm font-bold text-primary">Remove photo</Text>
            </Pressable>
          ) : null}
        </View>

        <View className="gap-3">
          <Text className="font-[Inter] text-base font-bold text-foreground">Profile</Text>
          <AccountField label="First name" value={firstName} onChangeText={setFirstName} />
          <AccountField label="Last name" value={lastName} onChangeText={setLastName} />
          <Pressable
            accessibilityRole="button"
            onPress={handleSaveProfile}
            disabled={!hasProfileChanges || isSaving}
            className={cn(
              "mt-1 rounded-full py-4",
              hasProfileChanges && !isSaving ? "bg-primary" : "bg-border",
            )}
          >
            <Text
              className={cn(
                "text-center font-[Lato] text-base font-bold",
                hasProfileChanges && !isSaving ? "text-white" : "text-foreground/40",
              )}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </Text>
          </Pressable>
        </View>

        <View className="gap-3">
          <Text className="font-[Inter] text-base font-bold text-foreground">Session</Text>
          <Pressable
            accessibilityRole="button"
            onPress={confirmSignOut}
            disabled={isSigningOut}
            className="rounded-full bg-red-50 py-4"
          >
            <Text className="text-center font-[Lato] text-base font-bold text-red-600">
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
