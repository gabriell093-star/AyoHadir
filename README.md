# AyoHadir

Aplikasi absensi Android berbasis Flutter.

## Status

Repository kerja utama AyoHadir. Foundation Flutter dari source AyoHadir sebelumnya telah dipindahkan ke repository ini tanpa direkonstruksi.

Source yang diimpor berasal dari commit publik:
- Repository: `primacynfachy-ai/AyoHadir`
- Commit: `35e1dd2b0315104fe574ad15b5fcb4480aaa7597`
- Scope saat source tersebut dibuat: **Foundation only**

Foundation yang diimpor meliputi `pubspec.yaml`, entry point Flutter, tema/konstanta, struktur feature/core, test widget, aturan agent, dan GitHub Actions Flutter CI.

## Source of truth produk

- `docs/PRD_Aplikasi_Absensi_QR.md`
- `docs/UIUX_Absensi_QR.md`
- `docs/stitch/dashboard_utama_ayo_hadir.html`
- `assets/images/ayo-hadir-logo.svg`

## Tahap saat ini

Foundation belum mengimplementasikan autentikasi, QR scanning/generation, GPS, offline sync, realtime, Supabase, riwayat, pembatalan, atau notifikasi. Fitur-fitur tersebut harus dibangun bertahap sesuai PRD dan UI/UX.

## Validasi

Repository memiliki GitHub Actions yang menjalankan:

```text
flutter pub get
dart format --output=none --set-exit-if-changed lib test
flutter analyze
flutter test
flutter build apk --release
```

Folder Android dibuat oleh workflow bila belum ada. Status lulus/gagal build harus dibuktikan dari workflow run, bukan diasumsikan dari keberadaan file source.
