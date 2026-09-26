# AyoHadir

Aplikasi absensi QR Android-first menggunakan **Expo React Native + TypeScript**.

## Status

Repository ini sekarang mengikuti arah pengembangan Expo. Foundation Flutter lama tidak lagi menjadi source project aktif.

### Source of truth produk

- `docs/PRD_Aplikasi_Absensi_QR.md`
- `docs/UIUX_Absensi_QR.md`
- `docs/stitch/dashboard_utama_ayo_hadir.html`
- `assets/images/ayo-hadir-logo.svg`

### Stack foundation

- Expo SDK 57
- React Native 0.86
- TypeScript
- Expo Router
- NativeWind 4
- Zustand
- Supabase
- expo-sqlite
- expo-secure-store

Expo SDK 57 saat ini menargetkan React Native 0.86 dan Android API level 36. NativeWind 4.2.7 adalah jalur stabil untuk Expo SDK 57; NativeWind 5 masih pre-release.

## Foundation

Repository saat ini menyediakan:
- routing Expo Router dengan lima tab dasar
- styling NativeWind
- struktur `src/` untuk komponen, state, theme, dan integrasi
- Supabase client berbasis SecureStore tanpa service-role key
- konfigurasi CNG untuk Android
- GitHub Actions untuk doctor, typecheck, lint, prebuild Android, dan release APK build

Fitur produk seperti Auth, QR dinamis, GPS, attendance, offline sync, riwayat, pembatalan, dan notifikasi **belum dianggap selesai** pada tahap foundation.

## Validasi

Jangan menganggap build berhasil hanya karena workflow tersedia. Status harus dibuktikan dari GitHub Actions.

Perintah lokal:

```text
npm install
npx expo-doctor
npm run typecheck
npm run lint
npx expo prebuild --platform android --non-interactive
cd android && ./gradlew assembleRelease
```
