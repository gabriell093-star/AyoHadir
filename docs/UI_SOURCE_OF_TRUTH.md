# AyoHadir UI Source of Truth

Status: FROZEN VISUAL BASELINE

## Authority
- Product behavior and requirements: `docs/PRD_Aplikasi_Absensi_QR.md`
- UX interaction guidance: `docs/UIUX_Absensi_QR.md`
- Visual source of truth for implemented screens: `docs/ui/screens/`
- Brand asset: `assets/images/ayo-hadir-icon.png` (runtime UI logo is rendered as native SVG in `src/components/ui.tsx`)

## Rules
1. The screens in `docs/ui/screens/` are the fixed visual reference for the Expo Android app.
2. Do not redesign, restyle, recolor, rename navigation labels, or introduce a different visual system unless the user explicitly requests a UI revision.
3. HTML files are design references only; they must be translated into native Expo React Native components, not embedded as the app runtime.
4. When the PRD requires a screen or state that is not yet represented, create it by extending the nearest approved screen using the same typography, spacing, surfaces, controls, icon language, and state treatment.
5. Product behavior comes from the PRD. A visual reference must not introduce product roles or flows that the PRD does not support. In particular, do not introduce an admin/community role.
6. Legacy files live under `docs/ui/legacy/` only for historical reference and must not be used as implementation targets.

## Approved screen set
- Welcome, login, login failure, password reset
- Home/dashboard
- Create attendance session and creation confirmation/success
- Active QR detail, history detail, expired QR
- QR scanner
- Attendance success and attendance proof
- Attendance history
- Cancellation request, submitted, approved, rejected
- Notifications
- Profile and profile settings
- Permissions: access, required, notifications
- Offline synchronization

## Branding
- Display name: AyoHadir!
- Expo slug: ayohadir
- Android application id: com.ayohadir.app
