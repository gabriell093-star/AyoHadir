# Dokumen Spesifikasi UI/UX
## Aplikasi Absensi QR Mobile-First

## 1. Pedoman Visual (Visual Guidelines)

- **Gaya Visual Utama:** Light Glassmorphism. Gunakan efek blur/transparency yang subtle agar tidak mengorbankan keterbacaan (readability).
- **Warna Dasar:** Putih bersih (`#FFFFFF`) dan abu-abu sangat terang untuk latar belakang, memberikan kesan clean.
- **Warna Aksen:** Hijau (`#10B981`) untuk tombol utama, indikator sukses, dan elemen interaktif.
- **Bentuk (Shapes):** Rounded cards (sudut membulat) pada semua kontainer dan tombol.
- **Shadows:** Soft shadow difus untuk memisahkan lapisan UI tanpa terlihat kaku.

## 2. Navigasi Utama (Bottom Navigation)

Navigasi utama:
- Beranda
- Riwayat
- QR
- Notifikasi
- Profil

**Catatan:** Tombol QR di tengah menggunakan aksen hijau, ikon QR putih, dan sedikit efek glass/transparan pada tepi tombol.

## 3. Spesifikasi Layar (Screen Details)

### Layar: Beranda

- Halo, Gabriel 👋
- ✓ Email Terverifikasi

**3 Aktivitas Absensi Terbaru:**
- 🟢 Rapat Tim (Hadir - 08:00)
- 🟢 Shift Pagi (Hadir - Kemarin)
- 🟡 Seminar (Terlambat - 2 Hari lalu)

**Konsep:** Tampilan disederhanakan dan fokus pada user. Tidak menggunakan layout dashboard admin yang rumit.

### Aksi Tombol QR (Tengah)

Saat tombol bulat QR ditekan, sebuah Bottom Sheet atau Modal transparan muncul dengan dua pilihan utama:

- **Buat QR:** Masuk ke flow pembuatan QR absensi.
- **Scan QR:** Membuka kamera scanner.

### Flow: Buat QR

Menggunakan form bertahap (Wizard) sederhana:

1. **Info Dasar:** Nama/Judul QR & Target Pengguna.
2. **Waktu:** Waktu Mulai, Waktu Berakhir, Batas Terlambat.
3. **Lokasi:** Aktifkan GPS + Atur Radius (5 meter hingga 3.000 meter).
4. **Review:** Ringkasan pengaturan → tekan **"Buat QR"**.

### Layar: QR Detail

- **Status:** QR Aktif.
- **Countdown:** Sisa masa berlaku (real-time).
- **Token Dinamis:** Animasi refresh token.
- **Aksi:** Bagikan, Download, Screenshot, Edit QR.
- **Info GPS:** Titik koordinat & radius aktif.
- **Daftar:** Riwayat absensi user pada QR ini.

### Flow: Scan QR & Bukti Absensi

- **Kamera Scanner:** UI viewfinder bersih dengan status validasi real-time.
- **Dukungan Offline:** Aplikasi menyimpan data scan sementara (sinkronisasi tertunda) saat tidak ada sinyal.
- **Status Scanning:** Berhasil, QR Expired, QR Tidak Valid, Sudah Absen, GPS Gagal (di luar radius).
- **Bukti Absensi (Tiket Digital):** Menampilkan Status (Hadir/Terlambat), Nama Pengguna, Tanggal, Waktu Scan, Kode Unik, Nama Perangkat, dan Data GPS jika diaktifkan oleh pembuat QR.

## 4. Manajemen Riwayat & Data

### Layar: Riwayat

- **Pemisahan Data Penting:** Tab atau toggle untuk membedakan:
  - "Riwayat Absensi Saya" (saat saya scan).
  - "Riwayat QR Buatan Saya" (data orang yang absen pada QR yang saya buat).
- **Fitur:** Daftar berbasis tanggal, Search Bar, dan Filter (Semua / Hadir / Terlambat).
- **Detail & Pembatalan:** Klik item untuk melihat detail absensi. Terdapat opsi **"Ajukan Pembatalan"**.
- **Aturan Pembatalan:** Data tidak dihapus. Aplikasi menggunakan perubahan Status dan mencatat Riwayat Tindakan (Audit Trail) untuk integritas data.

## 5. Notifikasi & Profil

### Layar: Notifikasi

- Absensi berhasil (real-time/sinkronisasi selesai).
- Peringatan QR hampir kedaluwarsa/telah kedaluwarsa.
- Status sinkronisasi data offline.
- Pembaruan status pengajuan pembatalan.

### Layar: Profil

- Foto & Nama Pengguna.
- Email & Status Verifikasi.
- Menu: Edit Profil, Ubah Password.
- Pusat Bantuan: Panduan Penggunaan.
- Privasi & Keamanan.
- Tombol Logout.

## 6. Standar Konsistensi (State Management)

Sistem harus menjaga konsistensi state UI di seluruh aplikasi:

- **Tanpa Role Admin:** Semua pengguna berada pada level atau kemampuan dasar yang sama. Setiap pengguna bisa membuat maupun melakukan scan QR.
- **Konektivitas:** Indikator jelas saat berada di State Offline dan animasi saat proses sinkronisasi sedang berjalan.
- **Feedback Visual:** Menggunakan Skeleton loading saat memuat data, ilustrasi yang ramah untuk Empty State (misalnya, "Belum ada absensi hari ini"), dan pesan yang jelas untuk Error State.