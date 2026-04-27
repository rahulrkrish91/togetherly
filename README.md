# Family Connection Hub

React Native (Expo) + TypeScript starter for a multi-family collaboration app with Firebase.

## Implemented in this starter

- Expo + TypeScript app bootstrap (`App.tsx`)
- Auth state provider (`AuthProvider`) with Firebase session listener
- Google Sign-In flow scaffold via `expo-auth-session` + Firebase credential exchange
- Phone auth flow scaffold via Firebase OTP + Expo reCAPTCHA modal
- Navigation foundation:
  - Auth stack
  - Main bottom tabs (Families, Chat, Calendar, Map, Profile)
- Family lifecycle scaffold: create/join/switch active family with Firestore + local persistence
- NativeWind/Tailwind setup (`tailwind.config.js`, Babel plugin)
- Firebase client setup (Auth, Firestore, Storage service modules)
- Core domain types and Firebase error parser
- Chat core scaffold: realtime listener room, text composer, media upload with progress/retry, pagination + lazy-load
- Family coordination tools scaffold: calendar month/agenda with event CRUD + live map sharing controls
- Initial screen stubs for feature verticals
- Initial Firestore rules draft with membership helper checks
- Firestore cost-control helpers for cache-first reads, pagination, delta sync, and no-op write prevention

## Run locally

```bash
npm install
npm run start
```

> If your environment blocks npm registry access, install from an approved mirror and then run the same commands.

## Environment variables

Create a `.env` file with:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
```

## Project structure

```text
App.tsx
src/
  app/
    navigation/
    screens/
  components/
  features/
    auth/
  services/
    firebase/
    firestore/
  types/
  utils/
firebase/
  firestore.rules
firebase-blueprint.json
```

## Auth flows in this baseline

- **Google login:** `useAuthRequest` starts OAuth and exchanges `idToken` with Firebase Auth.
- **Phone login:** send OTP with reCAPTCHA verifier and confirm with `verificationId + code`.
- **Session persistence:** uses React Native persistence with AsyncStorage in Firebase Auth initialization.

## Firestore bill reduction strategy (implemented + next)

### Reads

- Use cache-first helpers (`getDocCacheFirst`, `getQueryCacheFirst`) to avoid unnecessary server reads.
- Use paginated queries (`limit` + `startAfter`) for chat data.
- Use delta sync (`createdAt > lastSyncAt`) so the app only fetches new data.
- Read aggregate metadata from a single `familyMetadata/{familyId}` document rather than counting many docs.

### Writes

- Use `updateIfChanged` to skip no-op writes when document values have not changed.
- Use batch primitives (`createBatch`) for coordinated, lower-overhead multi-doc writes.

### Storage / model

- Keep unbounded items (messages/events) in collections, not parent arrays.
- Prefer shorter field names for very high-scale collections where storage size materially affects cost.

## Next implementation targets

1. Production-hardening for Google and phone auth + family invite edge-case handling.
2. Add family role management UI (promote/demote/remove members).
3. Harden chat room media pipeline (thumbnail previews, video playback, delivery receipts).
4. Add advanced event editing (time ranges, reminders, attendee mentions).
5. Add background location mode + battery-aware throttling policies.
6. Tighten Firestore rules with field-level validations and indexes.
