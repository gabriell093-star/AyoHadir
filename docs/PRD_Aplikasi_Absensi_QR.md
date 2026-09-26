# Product Requirements Document (PRD)
# APLIKASI ABSENSI BERBASIS QR

## 1. Gambaran Produk

Aplikasi absensi berbasis APK/Web yang memungkinkan setiap pengguna membuat maupun melakukan absensi melalui QR Code.

Produk ditujukan untuk penggunaan umum, terutama sekolah, perusahaan, organisasi, dan komunitas, tanpa sistem role Admin atau keanggotaan kelompok yang wajib.

**Prinsip utama:** mudah digunakan, aman, fleksibel, dan tetap dapat bekerja ketika perangkat sedang offline.

## 2. Akun

Pengguna dapat membuat akun secara mandiri menggunakan:
- Nama
- Email
- Password

Verifikasi email wajib dilakukan sebelum fitur absensi digunakan.

**Fitur akun:**
- Login/logout
- Verifikasi email
- Lupa/reset password melalui email
- Profil pengguna

Tidak terdapat role Admin. Semua pengguna memiliki kemampuan dasar yang sama.

## 3. Pembuatan QR

Setiap pengguna dapat membuat QR baru dengan pengaturan:
- Nama/judul QR
- Target pengguna: semua pengguna atau pengguna tertentu
- Jika dibatasi: minimal 1 dan maksimal 100 pengguna
- Masa berlaku: minimal 1 jam, maksimal 24 jam
- Waktu mulai dan waktu berakhir
- Batas waktu untuk status "Terlambat"
- GPS: aktif/nonaktif
- Radius GPS: 5–3.000 meter

QR dibuat secara online karena sesi dan kredensialnya harus didaftarkan ke server.

Pembuat otomatis menjadi pemilik QR dan memperoleh akses terhadap riwayat absensi QR tersebut.

QR yang masih aktif dapat diedit oleh pembuat.

## 4. QR Dinamis & Berbagi

QR menggunakan token dinamis agar screenshot atau salinan QR lama tidak mudah disalahgunakan.

Interval perubahan token dibuat tidak terlalu pendek agar tetap nyaman digunakan; **10 menit dapat menjadi nilai awal yang direkomendasikan**.

QR dapat:
- Ditampilkan langsung
- Screenshot
- Diunduh sebagai gambar
- Dibagikan melalui aplikasi lain

Saat QR akan dibagikan secara online dan GPS belum aktif, aplikasi memberikan peringatan:

> **Perhatian:** QR yang dibagikan secara online memiliki risiko penyalahgunaan. Kami menyarankan mengaktifkan verifikasi lokasi (GPS) untuk meningkatkan keamanan absensi.

Peringatan tidak memblokir proses berbagi.

## 5. GPS

GPS bersifat opsional untuk setiap QR.

Jika aktif:
- Sistem mengambil lokasi pembuat ketika QR dibuat.
- Lokasi tersebut menjadi titik pusat.
- Pembuat menentukan radius 5–3.000 meter.
- Saat scan, lokasi pengguna diperiksa terhadap titik tersebut.
- Pembuat dapat melihat status lokasi dan membuka detail lokasi pada peta.
- Jika lokasi tidak dapat diverifikasi, pengguna harus mencoba kembali dan belum dianggap berhasil absen.

## 6. Proses Absensi

### Online

1. Pengguna login.
2. Memindai QR.
3. Sistem memvalidasi QR, akun, target pengguna, waktu, dan GPS jika aktif.
4. Jika valid, absensi langsung tersimpan.
5. Sistem menampilkan bukti absensi dan kode unik.

### Offline

Scan tetap dapat dilakukan tanpa internet.

Data absensi disimpan sementara di perangkat dengan waktu scan dan informasi validasi yang diperlukan, kemudian disinkronkan ketika koneksi kembali tersedia.

**Status:**
- Menunggu sinkronisasi
- Tersinkronisasi
- Sinkronisasi tertunda

Waktu saat scan offline menjadi acuan absensi. Saat sinkronisasi, server tetap melakukan pemeriksaan keamanan dan integritas data.

Pengguna yang sudah melakukan absensi pada sesi tersebut akan diberi tahu saat mencoba scan kembali.

## 7. Bukti Absensi

Setiap absensi menghasilkan kode unik, misalnya:

`ABS-7K4P9X`

Kode tersebut muncul pada:
- Bukti absensi pengguna
- Riwayat pengguna
- Riwayat QR milik pembuat

Informasi absensi mencakup:
- Nama pengguna
- Tanggal
- Waktu server/waktu scan
- Status Hadir/Terlambat
- Kode unik
- Perangkat
- Informasi GPS jika diaktifkan

## 8. Riwayat

### Riwayat Pengguna

Menampilkan seluruh absensi yang dilakukan pengguna.

### Riwayat QR

Setiap QR memiliki riwayat sendiri.

Pembuat dapat melihat:
- Pengguna yang sudah absen
- Pengguna yang belum absen
- Waktu absensi
- Status Hadir/Terlambat
- Kode absensi
- Status GPS
- Detail lokasi jika GPS digunakan
- Status sinkronisasi

Pengguna hanya dapat melihat data absensinya sendiri. Pembuat hanya dapat mengakses data dari QR yang dibuatnya.

## 9. Pembatalan Absensi

Pengguna tidak dapat membatalkan absensi secara langsung.

Pengguna dapat menekan **Ajukan Pembatalan** pada riwayat dan memberikan alasan.

Pembuat QR dapat:
- Menyetujui
- Menolak

Semua tindakan pembatalan dicatat sebagai riwayat dan tidak menghilangkan jejak data asli.

Pembuat QR juga dapat membatalkan absensi tertentu dengan alasan.

## 10. Status QR

QR memiliki status:
- **Aktif**
- **Kedaluwarsa**
- **Dihapus**

Setelah kedaluwarsa, QR menjadi arsip dan tidak dapat digunakan lagi.

Pembuat dapat menghapus QR dari daftar miliknya. Penghapusan QR tidak menghapus catatan absensi yang telah tersimpan sebagai arsip.

## 11. Notifikasi

Sistem menyediakan notifikasi untuk:
- Absensi berhasil
- QR hampir kedaluwarsa
- QR kedaluwarsa
- Sinkronisasi berhasil
- Sinkronisasi tertunda
- Permintaan pembatalan baru
- Pembatalan disetujui
- Pembatalan ditolak
- Kejadian penting lain terkait QR atau absensi

## 12. Keamanan

Sistem menerapkan keamanan menyeluruh:
- HTTPS/TLS
- Password di-hash
- Validasi QR dilakukan di server
- Token QR bersifat acak dan memiliki masa berlaku
- Kontrol akses berdasarkan pemilik QR dan akun
- Perlindungan terhadap absensi ganda
- Pencatatan perangkat
- Audit log untuk perubahan dan pembatalan
- Data sensitif tidak disimpan langsung di dalam QR
- Validasi integritas data saat sinkronisasi offline

Tujuan sistem adalah mencegah penyalahgunaan atau titip absen tanpa membuat proses absensi menjadi rumit.

## 13. Panduan Dalam Aplikasi

APK/Web menyediakan menu Panduan yang menjelaskan:
- Pembuatan QR
- Pengaturan masa berlaku
- Pembatasan pengguna
- Penggunaan GPS
- Pembagian QR secara online
- Scan online/offline
- Sinkronisasi
- Riwayat
- Pengajuan pembatalan

Panduan harus menggunakan bahasa sederhana dan memberikan peringatan keamanan yang relevan.

## 14. Batasan MVP

Versi pertama berfokus pada:

**Akun → Buat QR → Atur QR → Scan → Validasi → Absensi → Riwayat → Sinkronisasi Offline → Pembatalan → Notifikasi**

UI/UX akan dibuat dalam PRD terpisah dengan arah desain profesional, bersih, modern, dan tidak generik.