# Family Connection Hub

React Native (Expo) + TypeScript starter for a multi-family collaboration app with Firebase.

## Implemented in this starter

- Expo + TypeScript app bootstrap (`App.tsx`)
- Navigation foundation:
  - Auth stack
  - Main bottom tabs (Families, Chat, Calendar, Map, Profile)
- NativeWind/Tailwind setup (`tailwind.config.js`, Babel plugin)
- Firebase client setup (Auth, Firestore, Storage service modules)
- Core domain types and Firebase error parser
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
  services/
    firestore/
  types/
  utils/
firebase/
  firestore.rules
firebase-blueprint.json
```

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

1. Real Google Sign-In flow with Firebase Auth session restore.
2. Family create/join/switch backed by Firestore collections.
3. Chat room screen with paginated messages and Storage uploads.
4. Calendar + event CRUD with role-aware permissions.
5. Live location map updates scoped by active family.
6. Tighten Firestore rules to match final document IDs and write validations.
