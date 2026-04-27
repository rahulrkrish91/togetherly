import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../../../components/common/Screen';
import { useAuth } from '../../../features/auth/AuthProvider';
import { useFamily } from '../../../features/families/FamilyProvider';
import {
  changeMemberRole,
  removeFamilyMember,
  subscribeFamilyMembers,
  upsertFamilyMemberProfile,
  type FamilyMemberRecord,
} from '../../../services/firestore/members';
import { saveUserProfile, uploadAvatar } from '../../../services/profile/profileService';

export default function ProfileScreen() {
  const { authUser, logout } = useAuth();
  const { activeFamilyId } = useFamily();
  const [displayName, setDisplayName] = useState(authUser?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(authUser?.photoURL || '');
  const [members, setMembers] = useState<FamilyMemberRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeFamilyId) {
      setMembers([]);
      return;
    }
    return subscribeFamilyMembers(activeFamilyId, setMembers, () => setError('Could not load members.'));
  }, [activeFamilyId]);

  const myRole = useMemo(
    () => members.find((m) => m.userId === authUser?.uid)?.role ?? 'member',
    [members, authUser?.uid]
  );
  const isAdmin = myRole === 'admin';

  const handlePickAvatar = async () => {
    if (!authUser) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    setError(null);
    try {
      const url = await uploadAvatar(authUser.uid, result.assets[0].uri, () => undefined);
      setAvatarUrl(url);
    } catch {
      setError('Avatar upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!authUser || !displayName.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await saveUserProfile(authUser, {
        displayName: displayName.trim(),
        photoURL: avatarUrl || null,
      });

      if (activeFamilyId) {
        await upsertFamilyMemberProfile({
          familyId: activeFamilyId,
          userId: authUser.uid,
          displayName: displayName.trim(),
          avatarUrl: avatarUrl || null,
        });
      }
    } catch {
      setError('Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleToggle = async (member: FamilyMemberRecord) => {
    if (!activeFamilyId || !isAdmin || member.userId === authUser?.uid) return;
    const nextRole = member.role === 'admin' ? 'member' : 'admin';
    await changeMemberRole({ familyId: activeFamilyId, userId: member.userId, role: nextRole });
  };

  const handleRemoveMember = async (member: FamilyMemberRecord) => {
    if (!activeFamilyId || !isAdmin || member.userId === authUser?.uid) return;
    await removeFamilyMember({ familyId: activeFamilyId, userId: member.userId });
  };

  return (
    <Screen>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 28 }}>
        <Text className="mt-3 text-2xl font-semibold text-slate-900">Profile & Permissions</Text>

        <View className="mt-4 rounded-xl bg-white p-4">
          <Text className="font-semibold text-slate-800">My profile</Text>

          <View className="mt-3 flex-row items-center gap-3">
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} className="h-16 w-16 rounded-full" />
            ) : (
              <View className="h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <Text className="text-lg font-semibold text-indigo-700">
                  {(displayName?.[0] || authUser?.email?.[0] || 'U').toUpperCase()}
                </Text>
              </View>
            )}

            <Pressable className="rounded-xl border border-brand px-4 py-2" onPress={handlePickAvatar}>
              <Text className="font-medium text-brand">Change Avatar</Text>
            </Pressable>
          </View>

          <TextInput
            className="mt-3 rounded-xl border border-slate-200 px-3 py-3"
            placeholder="Display name"
            value={displayName}
            onChangeText={setDisplayName}
          />

          <Pressable className="mt-3 rounded-xl bg-brand px-4 py-3" onPress={handleSaveProfile}>
            {saving || uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center font-medium text-white">Save Profile</Text>
            )}
          </Pressable>

          <Text className="mt-2 text-xs text-slate-500">Current role: {myRole.toUpperCase()}</Text>
        </View>

        <View className="mt-4 rounded-xl bg-white p-4">
          <Text className="font-semibold text-slate-800">Family members</Text>
          <Text className="mt-1 text-xs text-slate-500">
            {isAdmin
              ? 'Admin controls are enabled. You can change roles and remove members.'
              : 'Only family admins can manage member roles.'}
          </Text>

          {members.map((member) => (
            <View key={member.id} className="mt-3 rounded-xl border border-slate-200 px-3 py-3">
              <Text className="font-semibold text-slate-900">{member.displayName || member.userId}</Text>
              <Text className="mt-1 text-xs uppercase text-indigo-600">{member.role}</Text>

              {isAdmin && member.userId !== authUser?.uid ? (
                <View className="mt-2 flex-row gap-3">
                  <Pressable className="rounded-lg border border-brand px-3 py-2" onPress={() => handleRoleToggle(member)}>
                    <Text className="text-xs font-semibold text-brand">
                      {member.role === 'admin' ? 'Make Member' : 'Make Admin'}
                    </Text>
                  </Pressable>
                  <Pressable className="rounded-lg border border-red-500 px-3 py-2" onPress={() => handleRemoveMember(member)}>
                    <Text className="text-xs font-semibold text-red-600">Remove</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <Pressable className="mt-4 rounded-xl bg-slate-900 px-4 py-3" onPress={logout}>
          <Text className="text-center font-medium text-white">Sign out</Text>
        </Pressable>

        {error ? <Text className="mt-3 text-sm text-red-600">{error}</Text> : null}
      </ScrollView>
    </Screen>
  );
}
