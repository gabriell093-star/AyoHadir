# AyoHadir — Project Instructions

## Project
AyoHadir is an Android-first attendance application built with Expo React Native and TypeScript. Supabase is the backend target.

## Source of truth
- Product behavior: `docs/PRD_Aplikasi_Absensi_QR.md`
- UX guidance: `docs/UIUX_Absensi_QR.md`
- Fixed visual screen references: `docs/ui/screens/`
- UI baseline and precedence rules: `docs/UI_SOURCE_OF_TRUTH.md`
- Brand asset: `assets/images/ayo-hadir-logo.svg`

The visual design in `docs/ui/screens/` is frozen. Do not redesign, recolor, rename navigation labels, or replace the visual system unless the user explicitly requests a UI revision. HTML references are not runtime code; translate them into native Expo React Native components.

When a required product screen/state is absent from the approved references, create it by extending the nearest approved screen while preserving the same visual language. Follow the PRD for behavior; never introduce roles or flows that conflict with it.

## Technology
- Expo SDK 57
- React Native
- TypeScript
- Expo Router
- NativeWind v4
- Supabase
- expo-sqlite
- expo-secure-store

## Architecture
- app/: routes only
- src/components/: reusable UI
- src/features/: feature-specific logic
- src/lib/: integrations/infrastructure

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
