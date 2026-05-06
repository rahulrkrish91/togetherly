import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Screen from '../../../components/common/Screen';
import { useFamily } from '../../../features/families/FamilyProvider';
import { useAuth } from '../../../features/auth/AuthProvider';
import {
  FamilyEvent,
  EventCategory,
  createFamilyEvent,
  removeFamilyEvent,
  subscribeFamilyEvents,
} from '../../../services/firestore/events';

const categories: EventCategory[] = ['birthday', 'meeting', 'trip', 'custom'];

export default function CalendarScreen() {
  const { activeFamilyId } = useFamily();
  const { authUser } = useAuth();
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('meeting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeFamilyId) {
      setEvents([]);
      return;
    }

    return subscribeFamilyEvents(activeFamilyId, setEvents, () => setError('Could not load events.'));
  }, [activeFamilyId]);

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: boolean; dotColor: string; selected?: boolean }> = {};

    events.forEach((event) => {
      const day = event.startAt?.toDate?.().toISOString().slice(0, 10);
      if (day) {
        marks[day] = { marked: true, dotColor: '#6366F1' };
      }
    });

    marks[selectedDate] = { ...(marks[selectedDate] || { marked: true, dotColor: '#6366F1' }), selected: true };
    return marks;
  }, [events, selectedDate]);

  const dayEvents = useMemo(
    () => events.filter((event) => event.startAt?.toDate?.().toISOString().slice(0, 10) === selectedDate),
    [events, selectedDate]
  );

  const handleCreateEvent = async () => {
    if (!activeFamilyId || !authUser || !title.trim()) return;

    setError(null);
    try {
      await createFamilyEvent({
        familyId: activeFamilyId,
        title: title.trim(),
        description: description.trim(),
        category,
        startAt: new Date(`${selectedDate}T09:00:00`),
        createdBy: authUser.uid,
      });
      setTitle('');
      setDescription('');
      setCategory('meeting');
    } catch {
      setError('Could not create event. Please try again.');
    }
  };

  return (
    <Screen>
      <Text className="mt-3 text-2xl font-semibold text-slate-900">Family Calendar</Text>
      <Text className="mt-1 text-slate-600">Shared monthly view + day event agenda</Text>

      <View className="mt-4 overflow-hidden rounded-xl bg-white">
        <Calendar
          onDayPress={(d) => setSelectedDate(d.dateString)}
          markedDates={markedDates}
          theme={{
            todayTextColor: '#4F46E5',
            selectedDayBackgroundColor: '#6366F1',
            dotColor: '#6366F1',
          }}
        />
      </View>

      <View className="mt-4 rounded-xl bg-white p-4">
        <Text className="font-semibold text-slate-800">Create event for {selectedDate}</Text>
        <TextInput
          className="mt-3 rounded-xl border border-slate-200 px-3 py-3"
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          className="mt-3 rounded-xl border border-slate-200 px-3 py-3"
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />

        <View className="mt-3 flex-row flex-wrap gap-2">
          {categories.map((c) => (
            <Pressable
              key={c}
              className={`rounded-full px-3 py-2 ${category === c ? 'bg-brand' : 'bg-slate-200'}`}
              onPress={() => setCategory(c)}
            >
              <Text className={`${category === c ? 'text-white' : 'text-slate-700'} text-xs font-semibold`}>
                {c.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable className="mt-3 rounded-xl bg-brand px-4 py-3" onPress={handleCreateEvent}>
          <Text className="text-center font-medium text-white">Add Event</Text>
        </Pressable>
      </View>

      <View className="mt-4 rounded-xl bg-white p-4">
        <Text className="font-semibold text-slate-800">Agenda ({dayEvents.length})</Text>
        {dayEvents.length === 0 ? (
          <Text className="mt-2 text-slate-600">No events for this day.</Text>
        ) : (
          dayEvents.map((event) => (
            <View key={event.id} className="mt-3 rounded-xl border border-slate-200 px-3 py-3">
              <Text className="font-semibold text-slate-900">{event.title}</Text>
              <Text className="mt-1 text-sm text-slate-600">{event.description || 'No details'}</Text>
              <Text className="mt-1 text-xs uppercase text-indigo-600">{event.category}</Text>
              <Pressable className="mt-2" onPress={() => removeFamilyEvent(event.id)}>
                <Text className="text-sm font-medium text-red-600">Delete</Text>
              </Pressable>
            </View>
          ))
        )}

        {error ? <Text className="mt-3 text-sm text-red-600">{error}</Text> : null}
      </View>
    </Screen>
  );
}
