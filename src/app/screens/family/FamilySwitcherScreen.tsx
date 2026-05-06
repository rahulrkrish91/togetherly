import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Screen from '../../../components/common/Screen';
import { useFamily } from '../../../features/families/FamilyProvider';

export default function FamilySwitcherScreen() {
  const { families, activeFamilyId, isLoadingFamilies, createFamily, joinFamily, switchFamily } = useFamily();
  const [createName, setCreateName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeFamilyName = useMemo(
    () => families.find((familyItem) => familyItem.id === activeFamilyId)?.name ?? 'None selected',
    [activeFamilyId, families]
  );

  const handleCreateFamily = async () => {
    if (!createName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createFamily(createName);
      setCreateName('');
    } catch {
      setError('Could not create family right now.');
    } finally {
      setBusy(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await joinFamily(inviteCode);
      setInviteCode('');
    } catch {
      setError('Invite code is invalid or expired.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text className="mt-8 text-2xl font-semibold text-slate-900">Your Families</Text>
      <Text className="mt-2 text-slate-600">Active family: {activeFamilyName}</Text>

      <View className="mt-5 rounded-xl bg-white p-4">
        <Text className="font-semibold text-slate-800">Create family</Text>
        <TextInput
          className="mt-3 rounded-xl border border-slate-200 px-3 py-3"
          placeholder="Family name"
          value={createName}
          onChangeText={setCreateName}
        />
        <Pressable
          className="mt-3 rounded-xl bg-brand px-4 py-3"
          onPress={handleCreateFamily}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center font-medium text-white">Create Family</Text>
          )}
        </Pressable>
      </View>

      <View className="mt-4 rounded-xl bg-white p-4">
        <Text className="font-semibold text-slate-800">Join family</Text>
        <TextInput
          className="mt-3 rounded-xl border border-slate-200 px-3 py-3"
          autoCapitalize="characters"
          placeholder="Invite code"
          value={inviteCode}
          onChangeText={setInviteCode}
        />
        <Pressable
          className="mt-3 rounded-xl border border-brand px-4 py-3"
          onPress={handleJoinFamily}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#6366F1" />
          ) : (
            <Text className="text-center font-medium text-brand">Join Family</Text>
          )}
        </Pressable>
      </View>

      <View className="mt-4 rounded-xl bg-white p-4">
        <Text className="font-semibold text-slate-800">Switch family</Text>
        {isLoadingFamilies ? (
          <ActivityIndicator className="mt-4" color="#6366F1" />
        ) : families.length === 0 ? (
          <Text className="mt-3 text-slate-600">You are not in any family yet.</Text>
        ) : (
          families.map((familyItem) => {
            const active = familyItem.id === activeFamilyId;
            return (
              <Pressable
                key={familyItem.id}
                className={`mt-3 rounded-xl border px-4 py-3 ${
                  active ? 'border-brand bg-indigo-50' : 'border-slate-200'
                }`}
                onPress={() => switchFamily(familyItem.id)}
              >
                <Text className="text-slate-900">{familyItem.name}</Text>
                <Text className="mt-1 text-xs uppercase text-slate-500">
                  Invite: {familyItem.inviteCode || 'N/A'}
                </Text>
              </Pressable>
            );
          })
        )}

        {error ? <Text className="mt-3 text-sm text-red-600">{error}</Text> : null}
      </View>
    </Screen>
  );
}
