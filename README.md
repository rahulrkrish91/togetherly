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
- High-end chat UI template: minimalist glassmorphism list/window, online indicators, FAB, rich input bar, optimized FlatList
- Family coordination tools scaffold: calendar month/agenda with event CRUD + live map sharing controls
- Profile + permissions scaffold: profile edit (name/avatar), member management UI, admin-restricted actions
- Security hardening scaffold: stricter Firestore field validation, Storage rules, validator parity helpers
- Quality/ops scaffold: Vitest tests, CI workflow, telemetry event/error tracking
- Phase-2 scaffold: push notifications, offline queue/conflict resolution, WebRTC call session baseline
- Initial screen stubs for feature verticals
- Initial Firestore rules draft with membership helper checks
- Firestore cost-control helpers for cache-first reads, pagination, delta sync, and no-op write prevention

## Run locally

```bash
npm install
npm run start
```

> If your environment blocks npm registry access, install from an approved mirror and then run the same commands.


## Running the app

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env` from the variables listed below, then fill in your Firebase and Google OAuth values.

### 3) Start Expo Metro

```bash
npm run start
```

From the Expo terminal UI, press:

- `a` to open Android emulator/device
- `i` to open iOS simulator on macOS
- scan the QR code with Expo Go if all used native modules are supported by Expo Go

### 4) Run directly on Android emulator or USB device

```bash
npm run android
```

This uses the existing package script, which runs `expo run:android`.

## Creating an Android APK

You have two practical APK paths:

### Option A: Cloud/internal APK with EAS (recommended for sharing)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

The `preview` EAS profile is configured to produce an Android APK for internal installation.

### Option B: Local debug APK with Gradle

```bash
npm install
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
```

The generated debug APK will be at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

For local APK builds you need a working Android SDK, JDK, and Gradle environment. If you only need an installable file to share with testers, prefer the EAS `preview` build.

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
2. Harden member management workflows (confirm dialogs, audit logs, bulk invites).
3. Harden chat room media pipeline (thumbnail previews, video playback, delivery receipts).
4. Add advanced event editing (time ranges, reminders, attendee mentions).
5. Add background location mode + battery-aware throttling policies.
6. Replace call scaffold with end-to-end WebRTC signaling + TURN + in-call media controls.
