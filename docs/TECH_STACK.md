# AyoHadir — Technical Foundation

## Mobile
- Expo SDK 57
- React Native 0.86
- TypeScript
- Expo Router
- NativeWind 4

## State

## Backend
- Supabase
- Client uses only the publishable/anon key.

## Local persistence
- expo-sqlite for offline attendance data and sync queue.
- expo-secure-store for auth/session storage.

## Android strategy
The repository uses Expo Continuous Native Generation (CNG). The `android/` directory is generated when needed and is not source-controlled at foundation stage.

Generate Android files with:

```text
npx expo prebuild --platform android --non-interactive
```

CI validates source and Edge Functions; Android native files are generated only for the final build.
