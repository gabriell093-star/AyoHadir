# AyoHadir — Design System

Dokumen ini menerjemahkan spesifikasi UI/UX yang diberikan pengguna menjadi aturan implementasi visual untuk Flutter. Jika ada perbedaan dengan sumber UI/UX, sumber UI/UX menjadi acuan utama.

## Warna
- Background utama: `#FFFFFF`.
- Background pendukung: abu-abu sangat terang.
- Aksen/interaksi/success: `#10B981`.

## Komponen
- Gunakan Material 3.
- Prioritaskan rounded cards dan tombol.
- Gunakan soft shadow difus.
- Efek glassmorphism harus subtle dan tidak mengurangi readability.

## Navigasi
Bottom navigation memiliki lima tujuan: Beranda, Riwayat, QR, Notifikasi, Profil. Tombol QR menjadi aksi utama di tengah.

## State UI
Setiap layar yang memuat data harus memiliki desain untuk loading, empty, error, online, offline, dan sinkronisasi ketika relevan.

## Bahasa UI
Gunakan bahasa Indonesia yang sederhana, jelas, dan konsisten. Hindari istilah teknis pada antarmuka pengguna jika tidak diperlukan.

## Prinsip implementasi
- Jangan membuat dashboard admin karena produk tidak menggunakan role Admin.
- Jangan menambahkan warna atau pola visual besar yang bertentangan dengan pedoman UI/UX.
- Jangan mengarang layar/fitur yang belum ditentukan dalam PRD atau UI/UX tanpa instruksi eksplisit.
