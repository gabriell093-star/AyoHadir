# AyoHadir — Product Requirements Document

## Gambaran Produk
Aplikasi absensi berbasis APK/Web yang memungkinkan setiap pengguna membuat maupun melakukan absensi melalui QR Code. Ditujukan untuk sekolah, perusahaan, organisasi, dan komunitas. Tidak ada role Admin wajib. Prinsip utama: mudah digunakan, aman, fleksibel, dan tetap dapat bekerja saat offline.

## Akun
Pengguna membuat akun dengan nama, email, dan password. Verifikasi email wajib sebelum fitur absensi digunakan. Fitur: login/logout, verifikasi email, lupa/reset password melalui email, dan profil. Semua pengguna memiliki kemampuan dasar yang sama.

## Pembuatan QR
Setiap pengguna dapat membuat QR dengan nama/judul, target pengguna (semua atau tertentu), batas 1–100 pengguna bila dibatasi, masa berlaku 1–24 jam, waktu mulai/berakhir, batas status Terlambat, GPS aktif/nonaktif, dan radius 5–3.000 meter. QR dibuat online. Pembuat menjadi pemilik QR dan hanya memperoleh akses ke riwayat QR tersebut. QR aktif dapat diedit.

## QR Dinamis dan Berbagi
QR memakai token dinamis. Interval awal yang direkomendasikan adalah 10 menit agar tetap nyaman digunakan. QR dapat ditampilkan, di-screenshot, diunduh, dan dibagikan. Saat dibagikan online dan GPS belum aktif, aplikasi memberikan peringatan keamanan tetapi tidak memblokir berbagi.

## GPS
GPS opsional per QR. Jika aktif, lokasi pembuat saat QR dibuat menjadi titik pusat dan radius ditentukan pembuat. Saat scan, lokasi pengguna diperiksa terhadap titik tersebut. Pembuat dapat melihat status lokasi dan detail lokasi pada peta. Bila lokasi tidak dapat diverifikasi, absensi belum dianggap berhasil.

## Proses Absensi
### Online
Pengguna login, memindai QR, lalu server memvalidasi QR, akun, target pengguna, waktu, dan GPS bila aktif. Jika valid, absensi langsung tersimpan dan bukti absensi beserta kode unik ditampilkan.

### Offline
Scan tetap dapat dilakukan tanpa internet. Data disimpan sementara di perangkat dengan waktu scan dan informasi validasi yang diperlukan, kemudian disinkronkan saat koneksi kembali tersedia. Status: Menunggu sinkronisasi, Tersinkronisasi, atau Sinkronisasi tertunda. Server tetap memeriksa keamanan dan integritas saat sinkronisasi. Scan ulang pada sesi yang sama diberi tahu sebagai sudah absen.

## Bukti Absensi
Setiap absensi menghasilkan kode unik, misalnya `ABS-7K4P9X`. Data meliputi nama pengguna, tanggal, waktu server/waktu scan, status Hadir/Terlambat, kode unik, perangkat, dan informasi GPS bila diaktifkan.

## Riwayat
### Riwayat Pengguna
Menampilkan seluruh absensi yang dilakukan pengguna.

### Riwayat QR
Setiap QR memiliki riwayat sendiri. Pembuat dapat melihat pengguna yang sudah/belum absen, waktu, status Hadir/Terlambat, kode, status GPS, detail lokasi bila digunakan, dan status sinkronisasi. Pengguna hanya melihat datanya sendiri; pembuat hanya dapat mengakses data QR miliknya.

## Pembatalan Absensi
Pengguna tidak dapat membatalkan langsung. Pengguna dapat mengajukan pembatalan dengan alasan. Pembuat QR dapat menyetujui atau menolak. Semua tindakan dicatat sebagai riwayat dan jejak data asli dipertahankan. Pembuat juga dapat membatalkan absensi tertentu dengan alasan.

## Status QR
Aktif, Kedaluwarsa, Dihapus. Setelah kedaluwarsa, QR menjadi arsip dan tidak dapat digunakan. Penghapusan QR dari daftar milik pembuat tidak menghapus arsip absensi yang sudah tersimpan.

## Notifikasi
Absensi berhasil, QR hampir kedaluwarsa, QR kedaluwarsa, sinkronisasi berhasil, sinkronisasi tertunda, permintaan pembatalan baru, pembatalan disetujui/ditolak, dan kejadian penting lain terkait QR atau absensi.

## Keamanan
HTTPS/TLS, password di-hash, validasi QR di server, token acak dengan masa berlaku, kontrol akses berdasarkan pemilik QR dan akun, perlindungan absensi ganda, pencatatan perangkat, audit log perubahan/pembatalan, tidak menyimpan data sensitif langsung di QR, serta validasi integritas saat sinkronisasi offline.

## Panduan Dalam Aplikasi
Menu Panduan menjelaskan pembuatan QR, masa berlaku, pembatasan pengguna, GPS, berbagi QR online, scan online/offline, sinkronisasi, riwayat, dan pengajuan pembatalan menggunakan bahasa sederhana dan peringatan keamanan yang relevan.

## Batasan MVP
Fokus versi pertama: **Akun → Buat QR → Atur QR → Scan → Validasi → Absensi → Riwayat → Sinkronisasi Offline → Pembatalan → Notifikasi**.

Sumber: PRD pengguna yang disediakan untuk project AyoHadir.
