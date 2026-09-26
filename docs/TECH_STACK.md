# AyoHadir — Technical Foundation

## Mobile
- Expo SDK 57
- React Native 0.86
- TypeScript
- Expo Router
- NativeWind 4

## State
- Zustand

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

CI generates Android files temporarily and builds a release APK for verification.
