# AyoHadir — Project Instructions

## Project
AyoHadir is an Android-first attendance application built with Expo React Native and TypeScript. Supabase is the backend target.

## Source of truth
- docs/PRD_Aplikasi_Absensi_QR.md
- docs/UIUX_Absensi_QR.md
- docs/stitch/dashboard_utama_ayo_hadir.html
- assets/images/ayo-hadir-logo.svg

## Technology
- Expo SDK 57
- React Native
- TypeScript
- Expo Router
- NativeWind v4
- Zustand
- Supabase
- expo-sqlite
- expo-secure-store

## Architecture
- app/: routes only
- src/components/: reusable UI
- src/features/: feature-specific logic
- src/lib/: integrations/infrastructure
- src/state/: Zustand stores
- src/theme/: design tokens

## Security
- Client may use only the Supabase publishable/anon key.
- Never commit Supabase service-role keys or other secrets.
- Attendance authorization and validation must remain server-enforced.

## Product constraints
- No Admin role/dashboard unless explicitly added to the PRD.
- Every user can create and scan QR.
- Offline attendance preserves the original scan time and syncs later.
- Use the user-facing status wording “Sinkronisasi tertunda”.

## Validation
Do not claim validation passed without actual command or CI evidence.

Expected checks:
npm install
npx expo-doctor
npm run typecheck
npm run lint
npx expo prebuild --platform android --non-interactive
cd android && ./gradlew assembleRelease
