# AyoHadir!

Aplikasi absensi QR **Android-first** menggunakan Expo React Native + TypeScript.

## Sumber kebenaran

- Produk & fitur: `docs/PRD_Aplikasi_Absensi_QR.md`
- UX: `docs/UIUX_Absensi_QR.md`
- Baseline visual: `docs/UI_SOURCE_OF_TRUTH.md`
- Referensi layar: `docs/ui/screens/`
- Asset brand: `assets/images/ayo-hadir-logo.svg`

Folder `docs/ui/legacy/` dan artefak arsip lama sudah dikeluarkan dari repository karena tidak dipakai runtime.

## Stack

- Expo SDK 57
- React Native 0.86
- TypeScript
- Expo Router
- NativeWind 4
- Supabase Auth + Postgres + Realtime + Edge Functions
- expo-sqlite untuk antrean offline
- expo-secure-store untuk sesi dan identifier instalasi
- expo-device untuk metadata perangkat
- react-native-qrcode-svg + react-native-svg

Android application ID: `com.ayohadir.app`

## Struktur backend

Source Edge Functions yang sedang dipakai tersedia di:

`supabase/functions/`

Function utama:
- create-qr
- record-attendance
- rotate-qr-token
- update-qr
- delete-qr
- cancel-attendance
- review-cancellation

Semua function produksi diharuskan memakai autentikasi JWT.

## Status fitur

Alur utama PRD sudah dihubungkan ke backend nyata: akun, verifikasi email, pembuatan QR, target pengguna, GPS, token dinamis, scan online/offline, sinkronisasi, riwayat, pembatalan, notifikasi, dan audit.

Data transaksi pada Supabase saat audit terakhir kosong; repository juga tidak menyimpan screen test dengan data absensi contoh.

## Gate sebelum publikasi

1. Organisasi Supabase harus menggunakan paket Pro sesuai kebutuhan deployment.
2. Aktifkan Leaked Password Protection pada Supabase Auth.
3. Pastikan GitHub Actions terbaru berhasil untuk install dependency, Expo Doctor, TypeScript, lint, guard source, dan Deno type-check Edge Functions.
4. Setelah source gate lulus, lakukan satu build APK final dan uji perangkat nyata untuk kamera, GPS, QR dinamis, share/download, offline-sync, deep link auth, system UI, dan pembatalan.

## Validasi

Jangan menganggap build berhasil hanya karena workflow atau source tersedia. Status build dan test harus dibuktikan oleh output GitHub Actions atau hasil pengujian perangkat yang nyata.

Perintah lokal yang relevan:

```text
npm install
npx expo-doctor
npm run typecheck
npm run lint
npx expo prebuild --platform android --non-interactive
cd android && ./gradlew assembleRelease
```
