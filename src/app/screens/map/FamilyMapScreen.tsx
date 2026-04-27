import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Switch, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Screen from '../../../components/common/Screen';
import { useFamily } from '../../../features/families/FamilyProvider';
import { useAuth } from '../../../features/auth/AuthProvider';
import { publishLocation, subscribeFamilyLocations, type FamilyLocationPoint } from '../../../services/firestore/locations';

const intervalOptions = [5000, 15000, 30000] as const;

export default function FamilyMapScreen() {
  const { activeFamilyId } = useFamily();
  const { authUser } = useAuth();
  const [points, setPoints] = useState<FamilyLocationPoint[]>([]);
  const [shareLocation, setShareLocation] = useState(false);
  const [intervalMs, setIntervalMs] = useState<(typeof intervalOptions)[number]>(15000);
  const [status, setStatus] = useState('Location sharing is off');
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!activeFamilyId) {
      setPoints([]);
      return;
    }

    return subscribeFamilyLocations(activeFamilyId, setPoints, () => setStatus('Could not load map locations.'));
  }, [activeFamilyId]);

  useEffect(() => {
    const clear = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    if (!shareLocation || !activeFamilyId || !authUser) {
      clear();
      return clear;
    }

    const tick = async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setStatus('Location permission not granted.');
        setShareLocation(false);
        return;
      }

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await publishLocation({
        familyId: activeFamilyId,
        userId: authUser.uid,
        userLabel: authUser.displayName || authUser.phoneNumber || 'Member',
        lat: current.coords.latitude,
        lng: current.coords.longitude,
        accuracy: current.coords.accuracy ?? null,
      });

      setStatus(`Sharing every ${intervalMs / 1000}s`);
    };

    setLoading(true);
    tick()
      .then(() => setLoading(false))
      .catch(() => {
        setStatus('Unable to publish location right now.');
        setLoading(false);
      });

    timerRef.current = setInterval(() => {
      tick().catch(() => setStatus('Location update failed.'));
    }, intervalMs);

    return clear;
  }, [shareLocation, intervalMs, activeFamilyId, authUser]);

  const region = useMemo(() => {
    const first = points[0];
    return {
      latitude: first?.lat ?? 37.7749,
      longitude: first?.lng ?? -122.4194,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [points]);

  return (
    <Screen>
      <Text className="mt-3 text-2xl font-semibold text-slate-900">Live Family Map</Text>
      <Text className="mt-1 text-slate-600">See current family member locations in real time.</Text>

      <View className="mt-4 rounded-xl bg-white p-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold text-slate-800">Share my location</Text>
          <Switch value={shareLocation} onValueChange={setShareLocation} />
        </View>

        <Text className="mt-2 text-sm text-slate-600">{status}</Text>

        <View className="mt-3 flex-row gap-2">
          {intervalOptions.map((value) => (
            <Pressable
              key={value}
              className={`rounded-full px-3 py-2 ${intervalMs === value ? 'bg-brand' : 'bg-slate-200'}`}
              onPress={() => setIntervalMs(value)}
            >
              <Text className={`${intervalMs === value ? 'text-white' : 'text-slate-700'} text-xs font-semibold`}>
                {value / 1000}s
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mt-4 h-96 overflow-hidden rounded-xl bg-slate-100">
        <MapView style={{ flex: 1 }} initialRegion={region} region={region}>
          {points.map((point) => (
            <Marker
              key={point.id}
              coordinate={{ latitude: point.lat, longitude: point.lng }}
              title={point.userLabel}
              description={point.accuracy ? `±${Math.round(point.accuracy)}m` : 'Location update'}
            />
          ))}
        </MapView>
      </View>

      {loading ? <ActivityIndicator className="mt-4" color="#6366F1" /> : null}
    </Screen>
  );
}
