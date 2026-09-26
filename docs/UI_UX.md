# AyoHadir — UI/UX Specification

## Visual Guidelines
- Gaya utama: Light Glassmorphism dengan blur/transparency yang subtle dan tetap mudah dibaca.
- Latar: putih `#FFFFFF` dan abu-abu sangat terang.
- Aksen: hijau `#10B981` untuk tombol utama, indikator sukses, dan elemen interaktif.
- Bentuk: rounded cards dan tombol.
- Shadow: soft, difus, tidak kaku.

## Navigasi Utama
Bottom navigation:
1. Beranda
2. Riwayat
3. QR
4. Notifikasi
5. Profil

Tombol QR berada di tengah, menggunakan aksen hijau, ikon QR putih, dan sedikit efek glass/transparan di tepinya.

## Beranda
- Sapaan pengguna.
- Indikator email terverifikasi.
- Tiga aktivitas absensi terbaru dengan status Hadir/Terlambat.
- Tidak menggunakan dashboard bergaya admin yang kompleks.

## Aksi QR
Saat tombol QR tengah ditekan, tampilkan Bottom Sheet atau modal transparan berisi:
- Buat QR
- Scan QR

## Flow Buat QR
Wizard sederhana:
1. Info Dasar — nama/judul QR dan target pengguna.
2. Waktu — mulai, berakhir, dan batas terlambat.
3. Lokasi — GPS dan radius 5–3.000 meter.
4. Review — ringkasan lalu tombol `Buat QR`.

## QR Detail
- Status QR Aktif.
- Countdown masa berlaku secara real-time.
- Token dinamis dengan indikasi/animasi refresh.
- Aksi: Bagikan, Download, Screenshot, Edit QR.
- Informasi GPS dan radius bila aktif.
- Daftar riwayat absensi pada QR.

## Scan QR dan Bukti Absensi
- Kamera scanner dengan viewfinder bersih.
- Status validasi real-time.
- Dukungan offline dengan status sinkronisasi tertunda.
- Status scanning: Berhasil, QR Expired, QR Tidak Valid, Sudah Absen, GPS Gagal/di luar radius.
- Bukti absensi berupa tiket digital: status Hadir/Terlambat, nama pengguna, tanggal, waktu scan, kode unik, nama perangkat, serta GPS bila aktif.

## Riwayat
Dua bagian/tab:
- Riwayat Absensi Saya.
- Riwayat QR Buatan Saya.

Fitur: pengelompokan berdasarkan tanggal, search bar, filter Semua/Hadir/Terlambat, detail absensi, dan `Ajukan Pembatalan`. Data tidak dihapus; perubahan status dan audit trail digunakan untuk menjaga integritas.

## Notifikasi
- Absensi berhasil.
- QR hampir/telah kedaluwarsa.
- Status sinkronisasi offline.
- Pembaruan status pengajuan pembatalan.

## Profil
- Foto dan nama.
- Email dan status verifikasi.
- Edit Profil.
- Ubah Password.
- Pusat Bantuan/Panduan Penggunaan.
- Privasi & Keamanan.
- Logout.

## Konsistensi State
- Tidak ada role Admin.
- Semua pengguna dapat membuat dan scan QR.
- Indikator offline harus jelas.
- Tampilkan animasi saat sinkronisasi.
- Gunakan skeleton loading.
- Gunakan empty state yang ramah.
- Error state harus jelas dan mudah dipahami.

## Logo dan Identitas Visual
Logo AyoHadir yang diberikan pengguna menjadi aset identitas utama aplikasi. File sumber gambar belum dimasukkan ke repository pada tahap ini; penempatan aset akan dilakukan setelah format aset final ditentukan.

Sumber: dokumen UI/UX pengguna yang disediakan untuk project AyoHadir.
