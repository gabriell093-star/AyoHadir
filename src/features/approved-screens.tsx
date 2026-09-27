
import { useMemo, useState } from "react";
import { Image, Linking, Pressable, Switch, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "@/auth/auth-context";
import {
  Badge,
  BackHeader,
  BottomNav,
  ButtonText,
  DangerButton,
  GlassCard,
  MiniCalendar,
  OfflineBanner,
  PrimaryButton,
  ProgressBar,
  QrVisual,
  RowButton,
  Screen,
  SecondaryButton,
  Segmented,
  SectionTitle,
  SoftCard,
  StatCard,
  UI
} from "@/components/ui";

const logo = require("../../assets/images/ayo-hadir-icon.png");

function TextButton({ children, onPress, tone = "green" }: { children: string; onPress?: () => void; tone?: "green" | "gray" | "red" }) {
  return (
    <Pressable onPress={onPress}>
      <Text className={"text-sm font-bold " + (tone === "green" ? "text-emerald-600" : tone === "red" ? "text-red-600" : "text-gray-600")}>{children}</Text>
    </Pressable>
  );
}

function Brand() {
  return (
    <View className="items-center">
      <Image source={logo} resizeMode="contain" className="h-16 w-16 rounded-[20px]" />
      <Text className="mt-3 text-[28px] font-black tracking-tight text-emerald-700">AyoHadir!</Text>
    </View>
  );
}

export function WelcomeScreen() {
  const router = useRouter();
  return (
    <Screen scroll={false} contentClassName="items-center justify-center px-6">
      <View className="w-full max-w-md items-center">
        <Brand />
        <Text className="mt-8 text-center text-[30px] font-black text-gray-950">Simple, secure attendance.</Text>
        <Text className="mt-3 max-w-sm text-center text-base leading-6 text-gray-500">Absensi QR yang mudah digunakan, aman, fleksibel, dan tetap mendukung kondisi offline.</Text>
        <View className="mt-8 w-full gap-3">
          <PrimaryButton onPress={() => router.push("/sign-in")}>
            <View className="flex-row items-center gap-2"><ButtonText>Mulai</ButtonText><Text className="text-lg text-white">→</Text></View>
          </PrimaryButton>
          <SecondaryButton onPress={() => router.push("/sign-in")}><Text className="text-sm font-bold text-gray-800">Sudah punya akun? Masuk</Text></SecondaryButton>
        </View>
        <Text className="mt-7 text-center text-xs leading-5 text-gray-400">AyoHadir! untuk absensi QR yang ringkas dan transparan.</Text>
      </View>
    </Screen>
  );
}

export function LoginFailedScreen() {
  const router = useRouter();
  return (
    <Screen scroll={false} contentClassName="justify-center px-6">
      <View className="absolute inset-0 bg-emerald-50 opacity-60" />
      <GlassCard className="w-full max-w-md self-center p-6">
        <Brand />
        <View className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <Text className="text-sm font-bold text-red-700">Email atau kata sandi salah.</Text>
          <Text className="mt-1 text-xs leading-5 text-red-600">Periksa kembali data yang dimasukkan, atau gunakan pemulihan password.</Text>
        </View>
        <PrimaryButton className="mt-5" onPress={() => router.replace("/sign-in")}><ButtonText>Masuk lagi</ButtonText></PrimaryButton>
        <TextButton onPress={() => router.push("/forgot-password")}><TextButton>?</TextButton></TextButton>
      </GlassCard>
    </Screen>
  );
}

export function DashboardScreen() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const displayName = profile?.display_name || (typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "Pengguna");
  const verified = Boolean(user?.email_confirmed_at);
  const [online] = useState(true);
  const activities = [
    { title: "Rapat Tim", meta: "Hadir · 08:00", tone: "green" as const, icon: "✓" },
    { title: "Shift Pagi", meta: "Hadir · Kemarin", tone: "green" as const, icon: "✓" },
    { title: "Seminar", meta: "Terlambat · 2 Hari lalu", tone: "yellow" as const, icon: "!" }
  ];
  return (
    <Screen bottomNav="home">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-[28px] font-black text-gray-950">Halo, {displayName} 👋</Text>
          <View className="mt-2 flex-row items-center gap-2">
            <Badge tone={verified ? "green" : "yellow"}>{verified ? "✓ Email Terverifikasi" : "Email Belum Terverifikasi"}</Badge>
            <Badge tone={online ? "green" : "yellow"}>{online ? "Online" : "Offline"}</Badge>
          </View>
        </View>
        <Pressable onPress={() => router.push("/profile-settings")} className="h-11 w-11 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">
          <Text className="text-xl text-gray-600">⚙</Text>
        </Pressable>
      </View>

      <SoftCard>
        <Text className="text-xs font-bold uppercase tracking-[2px] text-emerald-700">Siap absen?</Text>
        <Text className="mt-2 text-[22px] font-black text-gray-950">Pindai QR dan konfirmasi kehadiran.</Text>
        <Text className="mt-2 text-sm leading-5 text-gray-600">Gunakan kamera untuk scan. Sistem memeriksa sesi, akun, waktu, target pengguna, dan GPS bila diaktifkan.</Text>
        <PrimaryButton className="mt-4" onPress={() => router.push("/screens/scan-qr")}><ButtonText>Quick Scan</ButtonText></PrimaryButton>
      </SoftCard>

      <View className="flex-row gap-3">
        <StatCard label="Absensi hari ini" value="3" delta="+1 dari kemarin" />
        <StatCard label="Tingkat kehadiran" value="98%" delta="+2% dari kemarin" />
      </View>

      <SectionTitle title="Aktivitas Terbaru" action={<TextButton onPress={() => router.push("/history")}>Lihat semua</TextButton>} />
      <GlassCard className="p-4">
        {activities.map((item) => (
          <RowButton key={item.title} icon={item.icon} title={item.title} subtitle={item.meta} trailing="" />
        ))}
      </GlassCard>

      <SectionTitle title="Sesi QR Aktif" />
      {[
        ["Pelatihan Keberlanjutan Q3", "09:00–11:30 WIB", "42/50", "Aktif"],
        ["Rapat Tim Mingguan", "13:00–15:00 WIB", "18/24", "Aktif"],
        ["Briefing Proyek Alpha", "16:00–17:00 WIB", "0/15", "Akan datang"]
      ].map((item) => (
        <GlassCard key={item[0]} className="p-4">
          <View className="flex-row items-start justify-between">
            <Badge tone={item[3] === "Aktif" ? "green" : "gray"}>{item[3]}</Badge>
            <Text className="text-lg text-gray-400">⋮</Text>
          </View>
          <Text className="mt-3 text-base font-extrabold text-gray-900">{item[0]}</Text>
          <Text className="mt-1 text-xs text-gray-500">◷ {item[1]}</Text>
          <View className="mt-4 flex-row items-center justify-between border-t border-gray-100 pt-3">
            <Text className="text-xs font-semibold text-gray-500">{item[2]} peserta</Text>
            <TextButton onPress={() => router.push("/screens/active-qr")}>Lihat QR</TextButton>
          </View>
        </GlassCard>
      ))}
    </Screen>
  );
}

export function QrHubScreen() {
  const router = useRouter();
  return (
    <Screen scroll={false} contentClassName="justify-end">
      <View className="flex-1" />
      <View className="rounded-t-[28px] border border-gray-100 bg-white p-6 shadow-sm">
        <View className="mx-auto h-1.5 w-12 rounded-full bg-gray-200" />
        <Text className="mt-5 text-xl font-black text-gray-950">Aksi QR</Text>
        <Text className="mt-1 text-sm text-gray-500">Pilih aksi yang ingin dilakukan.</Text>
        <Pressable onPress={() => router.push("/screens/create-session")} className="mt-5 flex-row items-center rounded-2xl bg-emerald-500 px-4 py-4">
          <Text className="mr-3 text-2xl text-white">▦</Text><View className="flex-1"><Text className="font-black text-white">Buat QR</Text><Text className="mt-1 text-xs text-emerald-50">Buat sesi absensi baru.</Text></View><Text className="text-xl text-white">→</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/screens/scan-qr")} className="mt-3 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4">
          <Text className="mr-3 text-2xl text-emerald-600">⌗</Text><View className="flex-1"><Text className="font-black text-gray-900">Scan QR</Text><Text className="mt-1 text-xs text-gray-500">Buka scanner kamera.</Text></View><Text className="text-xl text-gray-300">→</Text>
        </Pressable>
      </View>
      <BottomNav active="qr" />
    </Screen>
  );
}

export function CreateSessionScreen() {
  const router = useRouter();
  const [target, setTarget] = useState("Semua Pengguna");
  const [duration, setDuration] = useState(8);
  const [gps, setGps] = useState(true);
  const [radius, setRadius] = useState(150);
  return (
    <Screen scroll={false}>
      <BackHeader title="Buat Sesi Absensi" right={<Pressable onPress={() => router.back()}><Text className="text-xl text-gray-400">×</Text></Pressable>} />
      <ScrollishCreate target={target} setTarget={setTarget} duration={duration} setDuration={setDuration} gps={gps} setGps={setGps} radius={radius} setRadius={setRadius} router={router} />
    </Screen>
  );
}

function ScrollishCreate({
  target,setTarget,duration,setDuration,gps,setGps,radius,setRadius,router
}: any) {
  return (
    <ScrollViewFallback>
      <View className="gap-5 px-5 pb-28 pt-5">
        <View>
          <Text className="text-xs font-bold uppercase tracking-[2px] text-emerald-700">01 · Info Dasar</Text>
          <Text className="mt-1 text-lg font-black text-gray-900">Nama sesi</Text>
          <TextInput className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900" placeholder="Contoh: Rapat Tim Pagi" placeholderTextColor="#94A3B8" defaultValue="Pelatihan Keberlanjutan Q3" />
        </View>
        <View>
          <Text className="text-sm font-bold text-gray-800">Target Pengguna</Text>
          <Segmented items={["Semua Pengguna","Pengguna Tertentu"]} value={target} onChange={setTarget} />
        </View>

        <GlassCard>
          <Text className="text-xs font-bold uppercase tracking-[2px] text-emerald-700">02 · Waktu</Text>
          <View className="mt-4 flex-row gap-3">
            <View className="flex-1"><Text className="text-xs font-semibold text-gray-500">Mulai</Text><View className="mt-2 rounded-2xl bg-gray-50 px-4 py-3.5"><Text className="font-bold text-gray-900">09:00 WIB</Text></View></View>
            <View className="flex-1"><Text className="text-xs font-semibold text-gray-500">Berakhir</Text><View className="mt-2 rounded-2xl bg-gray-50 px-4 py-3.5"><Text className="font-bold text-gray-900">{duration + 1}:00 WIB</Text></View></View>
          </View>
          <Text className="mt-4 text-xs font-semibold text-gray-500">Durasi · {duration} jam</Text>
          <View className="mt-2 flex-row items-center gap-2"><Pressable onPress={() => setDuration(Math.max(1,duration-1))} className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"><Text>−</Text></Pressable><View className="flex-1"><ProgressBar value={(duration/24)*100} /></View><Pressable onPress={() => setDuration(Math.min(24,duration+1))} className="h-10 w-10 items-center justify-center rounded-full bg-emerald-50"><Text className="text-emerald-700">+</Text></Pressable></View>
          <Text className="mt-2 text-xs text-gray-400">Minimal 1 jam · maksimal 24 jam</Text>
          <View className="mt-4"><Text className="text-xs font-semibold text-gray-500">Batas Terlambat</Text><View className="mt-2 rounded-2xl border border-gray-200 bg-white px-4 py-3.5"><Text className="font-bold text-gray-900">09:15</Text></View></View>
        </GlassCard>

        <GlassCard>
          <View className="flex-row items-center justify-between">
            <View className="flex-1"><Text className="text-xs font-bold uppercase tracking-[2px] text-emerald-700">03 · Lokasi</Text><Text className="mt-1 text-base font-black text-gray-900">GPS & Geofencing</Text><Text className="mt-1 text-xs leading-5 text-gray-500">Batasi absensi pada titik lokasi tertentu.</Text></View>
            <Switch value={gps} onValueChange={setGps} trackColor={{false:"#E5E7EB",true:"#6EE7B7"}} thumbColor="#FFFFFF" />
          </View>
          {gps ? <View className="mt-4"><View className="flex-row justify-between"><Text className="text-xs font-semibold text-gray-500">Radius</Text><Text className="text-xs font-bold text-emerald-700">{radius} m</Text></View><View className="mt-2 flex-row items-center gap-2"><Pressable onPress={() => setRadius(Math.max(5,radius-25))} className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"><Text>−</Text></Pressable><View className="flex-1"><ProgressBar value={((radius-5)/2995)*100} /></View><Pressable onPress={() => setRadius(Math.min(3000,radius+25))} className="h-10 w-10 items-center justify-center rounded-full bg-emerald-50"><Text className="text-emerald-700">+</Text></Pressable></View><View className="mt-4 h-40 items-center justify-center rounded-2xl bg-emerald-50"><Text className="text-4xl text-emerald-600">⌖</Text><Text className="mt-2 text-xs font-semibold text-gray-600">Lokasi saat ini · Radius {radius} m</Text></View></View> : <OfflineBanner text="GPS nonaktif. QR tetap dapat dibuat dan lokasi tidak digunakan saat validasi." />}
        </GlassCard>

        <GlassCard>
          <Text className="text-xs font-bold uppercase tracking-[2px] text-emerald-700">04 · Review</Text>
          <Text className="mt-2 text-lg font-black text-gray-900">Siap membuat QR?</Text>
          <Text className="mt-2 text-sm leading-5 text-gray-500">QR dibuat secara online dan akan memakai token dinamis untuk mengurangi risiko penyalahgunaan.</Text>
          <View className="mt-4 rounded-2xl bg-gray-50 p-4"><Text className="text-xs font-semibold text-gray-500">Ringkasan</Text><Text className="mt-2 text-sm font-bold text-gray-900">Pelatihan Keberlanjutan Q3</Text><Text className="mt-1 text-xs text-gray-500">{duration} jam · {target} · GPS {gps ? "aktif" : "nonaktif"}</Text></View>
          <PrimaryButton className="mt-4" onPress={() => router.push("/screens/confirm-qr")}><ButtonText>Buat QR</ButtonText></PrimaryButton>
        </GlassCard>
      </View>
    </ScrollViewFallback>
  );
}

function ScrollViewFallback({ children }: { children: React.ReactNode }) {
  return <View className="flex-1">{children}</View>;
}

export function ConfirmQrScreen() {
  const router = useRouter();
  return (
    <Screen>
      <BackHeader title="Konfirmasi QR" />
      <GlassCard>
        <Text className="text-xs font-bold uppercase tracking-[2px] text-emerald-700">Konfirmasi Pengaturan</Text>
        <Text className="mt-2 text-2xl font-black text-gray-950">Confirm QR Settings</Text>
        <Text className="mt-2 text-sm leading-5 text-gray-500">Periksa detail sesi sebelum mendaftarkannya ke server.</Text>
        {[
          ["Judul", "Pelatihan Keberlanjutan Q3"],
          ["Target", "Semua Pengguna"],
          ["Waktu", "15 Agustus 2024 · 09:00–17:00 WIB"],
          ["Terlambat", "Setelah 09:15"],
          ["GPS", "Aktif · radius 150 m"]
        ].map((x) => <View key={x[0]} className="mt-4 flex-row justify-between gap-4 border-b border-gray-100 pb-3"><Text className="text-xs font-semibold text-gray-500">{x[0]}</Text><Text className="max-w-[65%] text-right text-sm font-bold text-gray-900">{x[1]}</Text></View>)}
        <PrimaryButton className="mt-6" onPress={() => router.push("/screens/qr-success")}><ButtonText>Konfirmasi & Daftarkan</ButtonText></PrimaryButton>
        <SecondaryButton className="mt-3" onPress={() => router.back()}><Text className="text-sm font-bold text-gray-800">Edit Pengaturan</Text></SecondaryButton>
      </GlassCard>
    </Screen>
  );
}

export function QrSuccessScreen() {
  const router = useRouter();
  return (
    <Screen bottomNav="home">
      <View className="items-center pt-5">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-50"><Text className="text-4xl text-emerald-600">✓</Text></View>
        <Text className="mt-5 text-center text-2xl font-black text-gray-950">QR Berhasil Dibuat!</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-gray-500">Sesi sudah terdaftar dan siap digunakan.</Text>
      </View>
      <GlassCard className="items-center">
        <Text className="text-base font-black text-gray-900">Pelatihan Keberlanjutan Q3</Text>
        <Text className="mt-1 text-xs text-gray-500">Aktif · 15 Agustus 2024 · 09:00 WIB</Text>
        <View className="mt-5"><QrVisual size={210} label="QR AKTIF" /></View>
        <Text className="mt-4 text-center text-xs leading-5 text-gray-500">Bagikan atau unduh QR. Bila GPS tidak aktif, aplikasi akan memberi peringatan keamanan sebelum berbagi.</Text>
      </GlassCard>
      <View className="flex-row gap-3">
        <SecondaryButton className="flex-1"><Text className="text-sm font-bold text-gray-800">↗ Bagikan</Text></SecondaryButton>
        <SecondaryButton className="flex-1"><Text className="text-sm font-bold text-gray-800">↓ Unduh</Text></SecondaryButton>
      </View>
      <PrimaryButton onPress={() => router.push("/screens/active-qr")}><ButtonText>Lihat Sesi</ButtonText></PrimaryButton>
      <TextButton onPress={() => router.push("/history")}>Lihat Riwayat Sesi</TextButton>
    </Screen>
  );
}

export function ActiveQrScreen() {
  const router = useRouter();
  return (
    <Screen>
      <BackHeader title="Detail Sesi QR" />
      <View className="flex-row items-start justify-between">
        <View className="flex-1"><Text className="text-2xl font-black text-emerald-700">Pelatihan Keberlanjutan Q3</Text><MiniCalendar date="15 Agustus 2024 · 09:00 WIB" /></View>
        <Badge>Aktif</Badge>
      </View>
      <GlassCard className="items-center">
        <Text className="text-lg font-black text-gray-900">Pindai untuk Hadir</Text>
        <View className="mt-5"><QrVisual size={232} label="TOKEN DINAMIS" /></View>
        <View className="mt-5 w-full"><View className="flex-row justify-between"><Text className="text-xs text-gray-500">Token dinamis</Text><Text className="text-xs font-bold text-emerald-700">08:45</Text></View><ProgressBar value={85}/><Text className="mt-2 text-center text-[11px] text-gray-400">QR Code diperbarui otomatis untuk keamanan.</Text></View>
      </GlassCard>
      <View className="flex-row gap-3"><SecondaryButton className="flex-1"><Text className="text-sm font-bold text-gray-800">↗ Bagikan QR</Text></SecondaryButton><SecondaryButton className="flex-1"><Text className="text-sm font-bold text-gray-800">↓ Download</Text></SecondaryButton></View>
      <GlassCard>
        <Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Status Kehadiran</Text>
        <View className="mt-2 flex-row items-end"><Text className="text-4xl font-black text-emerald-600">42</Text><Text className="mb-1 ml-2 text-sm text-gray-500">/ 50 peserta</Text></View>
        <PrimaryButton className="mt-4" onPress={() => router.push("/screens/history-session")}><ButtonText>Lihat Riwayat Kehadiran →</ButtonText></PrimaryButton>
      </GlassCard>
      <View className="h-32 items-center justify-center rounded-2xl bg-emerald-50"><Text className="text-3xl text-emerald-600">⌖</Text><Text className="mt-2 text-xs font-semibold text-gray-600">Ruang Auditorium Utama · GPS 150 m</Text></View>
      <GlassCard>
        <RowButton icon="✎" title="Edit Detail Sesi" trailing="›" />
        <RowButton icon="⌖" title="Pengaturan Batasan Wilayah" trailing="›" />
      </GlassCard>
      <DangerButton onPress={() => router.push("/screens/expired-qr")}><Text className="font-bold text-red-700">Hapus Sesi</Text></DangerButton>
    </Screen>
  );
}

export function HistorySessionScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("Semua");
  const rows = [
    ["Budi Santoso", "09:02 WIB", "Hadir", "ABS-7K4P9X"],
    ["Siti Rahma", "09:17 WIB", "Terlambat", "ABS-9Q2M1K"],
    ["Andi Wijaya", "—", "Belum Absen", "—"],
    ["Dewi Putri", "09:04 WIB", "Hadir", "ABS-4J8T3A"]
  ];
  return (
    <Screen>
      <BackHeader title="Detail Riwayat Sesi QR" />
      <Text className="text-2xl font-black text-gray-950">Team Sync & Workshop</Text>
      <Text className="mt-1 text-sm text-gray-500">15 Agustus 2024 · 24 target pengguna</Text>
      <Segmented items={["Semua","Hadir","Terlambat"]} value={filter} onChange={setFilter} />
      <GlassCard className="p-4">
        {rows.filter((r) => filter === "Semua" || r[2] === filter).map((r) => <View key={r[0]} className="flex-row items-center border-b border-gray-100 py-3"><View className="h-9 w-9 items-center justify-center rounded-full bg-emerald-50"><Text className="text-sm font-black text-emerald-700">{r[0].charAt(0)}</Text></View><View className="ml-3 flex-1"><Text className="text-sm font-bold text-gray-900">{r[0]}</Text><Text className="mt-1 text-[11px] text-gray-500">{r[3]}</Text></View><View className="items-end"><Badge tone={r[2] === "Hadir" ? "green" : r[2] === "Terlambat" ? "yellow" : "gray"}>{r[2]}</Badge><Text className="mt-1 text-[10px] text-gray-400">{r[1]}</Text></View></View>)}
      </GlassCard>
      <SecondaryButton onPress={() => router.push("/history")}><Text className="text-sm font-bold text-gray-800">Kembali ke Riwayat</Text></SecondaryButton>
    </Screen>
  );
}

export function ExpiredQrScreen() {
  const router = useRouter();
  return (
    <Screen bottomNav="history">
      <BackHeader title="Detail Sesi" />
      <View className="items-center pt-3">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100"><Text className="text-3xl text-gray-500">×</Text></View>
        <Text className="mt-5 text-2xl font-black text-gray-950">QR Kedaluwarsa</Text>
        <Badge tone="gray">Kedaluwarsa</Badge>
      </View>
      <GlassCard>
        <Text className="text-base font-black text-gray-900">Pelatihan Keberlanjutan Q3</Text>
        <Text className="mt-1 text-sm text-gray-500">Berakhir 15 Agustus 2024 · 17:00 WIB</Text>
        <Text className="mt-4 text-sm leading-6 text-gray-600">Sesi sudah tidak dapat digunakan untuk absensi. Riwayat tetap tersimpan sebagai arsip.</Text>
        <View className="mt-4 items-center"><QrVisual size={190} label="ARSIP" /></View>
      </GlassCard>
      <PrimaryButton onPress={() => router.push("/history")}><ButtonText>Lihat Riwayat</ButtonText></PrimaryButton>
      <DangerButton><Text className="font-bold text-red-700">Hapus dari daftar saya</Text></DangerButton>
    </Screen>
  );
}

export function ScanQrScreen() {
  const router = useRouter();
  const [online] = useState(true);
  return (
    <Screen scroll={false} contentClassName="bg-gray-950" bottomNav={null}>
      <View className="flex-1 bg-gray-950">
        <View className="flex-row items-center justify-between px-4 py-3"><Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white/10"><Text className="text-xl text-white">‹</Text></Pressable><Text className="text-base font-black text-white">Pindai QR</Text><Badge tone={online ? "green" : "yellow"}>{online ? "Online" : "Offline"}</Badge></View>
        <View className="flex-1 items-center justify-center">
          <View className="h-[300px] w-[300px] items-center justify-center rounded-[26px] border-2 border-white/80">
            <View className="absolute -top-1 -left-1 h-12 w-12 rounded-tl-2xl border-l-4 border-t-4 border-emerald-300" />
            <View className="absolute -top-1 -right-1 h-12 w-12 rounded-tr-2xl border-r-4 border-t-4 border-emerald-300" />
            <View className="absolute -bottom-1 -left-1 h-12 w-12 rounded-bl-2xl border-b-4 border-l-4 border-emerald-300" />
            <View className="absolute -bottom-1 -right-1 h-12 w-12 rounded-br-2xl border-b-4 border-r-4 border-emerald-300" />
            <View className="h-px w-full bg-emerald-300" />
          </View>
          <Text className="mt-8 px-6 text-center text-sm font-semibold text-white">Posisikan kode QR di dalam bingkai</Text>
          <View className="mt-12 flex-row gap-5">
            <Pressable className="h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10"><Text className="text-xl text-white">◉</Text><Text className="text-[9px] text-white">Flash</Text></Pressable>
            <Pressable onPress={() => router.push("/screens/attendance-success")} className="h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10"><Text className="text-xl text-white">⌨</Text><Text className="text-[9px] text-white">Manual</Text></Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}

export function AttendanceSuccessScreen() {
  const router = useRouter();
  return (
    <Screen>
      <View className="items-center pt-3">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-emerald-50"><Text className="text-5xl text-emerald-600">✓</Text></View>
        <Text className="mt-5 text-2xl font-black text-gray-950">Absensi Berhasil!</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-gray-500">Kehadiran Anda sudah tercatat pada sesi Pelatihan Keberlanjutan Q3.</Text>
      </View>
      <GlassCard>
        <Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Kode Absensi</Text>
        <View className="mt-2 flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-4"><Text className="font-black tracking-[2px] text-gray-900">ABS-7K4P9X</Text><Text className="text-emerald-600">⧉</Text></View>
        <View className="mt-4 flex-row justify-between"><Text className="text-xs text-gray-500">Status</Text><Badge>Hadir</Badge></View>
        <View className="mt-3 flex-row justify-between"><Text className="text-xs text-gray-500">Waktu</Text><Text className="text-xs font-bold text-gray-900">09:02 WIB</Text></View>
      </GlassCard>
      <SecondaryButton><Text className="text-sm font-bold text-gray-800">↓ Download Receipt</Text></SecondaryButton>
      <PrimaryButton onPress={() => router.push("/screens/attendance-proof")}><ButtonText>Lihat Bukti Absensi</ButtonText></PrimaryButton>
      <TextButton onPress={() => router.replace("/")}>Tutup</TextButton>
    </Screen>
  );
}

export function AttendanceProofScreen() {
  const router = useRouter();
  return (
    <Screen bottomNav="history">
      <BackHeader title="Bukti Absensi" right={<Badge>Sync</Badge>} />
      <GlassCard>
        <View className="items-center"><Image source={logo} resizeMode="contain" className="h-12 w-12 rounded-2xl" /><Text className="mt-2 text-lg font-black text-emerald-700">AyoHadir!</Text><Text className="mt-1 text-xs text-gray-500">Bukti Absensi Digital</Text></View>
        <View className="my-5 border-t border-dashed border-gray-200" />
        {[
          ["Nama", "Budi Santoso"],
          ["Sesi", "Pelatihan Keberlanjutan Q3"],
          ["Tanggal", "15 Agustus 2024"],
          ["Waktu Scan", "09:02 WIB"],
          ["Status", "Hadir"],
          ["Kode", "ABS-7K4P9X"],
          ["Perangkat", "Android · Redmi"],
          ["GPS", "Terverifikasi · radius 150 m"]
        ].map((x) => <View key={x[0]} className="mb-3 flex-row justify-between gap-4"><Text className="text-xs text-gray-500">{x[0]}</Text><Text className="flex-1 text-right text-xs font-bold text-gray-900">{x[1]}</Text></View>)}
        <View className="mt-4 items-center"><QrVisual size={130} label="BUKTI" /></View>
      </GlassCard>
      <SecondaryButton onPress={() => router.push("/screens/cancellation-request")}><Text className="text-sm font-bold text-gray-800">Ajukan Pembatalan</Text></SecondaryButton>
      <OfflineBanner text="Sinkronisasi tertunda akan tetap memakai waktu scan asli sebagai acuan absensi." />
    </Screen>
  );
}

export function HistoryScreen() {
  const [mode, setMode] = useState("Absensi Saya");
  const [filter, setFilter] = useState("Semua");
  const rows = [
    ["Meeting Ruang Utama","15 Agustus 2024 · 08:02","Hadir","ABS-7K4P9X"],
    ["Pelatihan Keselamatan Kerja","14 Agustus 2024 · 09:16","Terlambat","ABS-5P8X2M"],
    ["Briefing Proyek Alpha","12 Agustus 2024 · 08:00","Hadir","ABS-2K3L8Q"]
  ];
  return (
    <Screen bottomNav="history">
      <View className="flex-row items-center justify-between"><View><Text className="text-[28px] font-black text-gray-950">Riwayat Absensi</Text><Text className="mt-1 text-sm text-gray-500">Semua aktivitas absensi Anda.</Text></View><Pressable className="h-11 w-11 items-center justify-center rounded-full bg-gray-50"><Text>⌕</Text></Pressable></View>
      <Segmented items={["Absensi Saya","Sesi Saya"]} value={mode} onChange={setMode} />
      <View className="flex-row gap-2"><Segmented items={["Semua","Hadir","Terlambat"]} value={filter} onChange={setFilter} /></View>
      <TextInput className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900" placeholder="Cari riwayat..." placeholderTextColor="#94A3B8" />
      {mode === "Absensi Saya" ? rows.filter((r) => filter === "Semua" || r[2] === filter).map((r) => (
        <GlassCard key={r[3]} className="p-4"><View className="flex-row items-start justify-between"><View className="flex-1"><Text className="text-base font-black text-gray-900">{r[0]}</Text><Text className="mt-1 text-xs text-gray-500">{r[1]}</Text></View><Badge tone={r[2] === "Hadir" ? "green" : "yellow"}>{r[2]}</Badge></View><View className="mt-4 flex-row items-center justify-between border-t border-gray-100 pt-3"><Text className="text-[11px] font-semibold tracking-[1px] text-gray-400">{r[3]}</Text><TextButton>Detail</TextButton></View></GlassCard>
      )) : (
        <GlassCard><Text className="text-sm font-bold text-gray-900">Sesi QR Buatan Saya</Text><Text className="mt-2 text-sm text-gray-500">Pelatihan Keberlanjutan Q3 · 42/50 peserta</Text><Text className="mt-4 text-sm font-bold text-emerald-700">Lihat detail →</Text></GlassCard>
      )}
    </Screen>
  );
}

export function CancellationRequestScreen() {
  const router = useRouter();
  const [reason, setReason] = useState("");
  return (
    <Screen>
      <BackHeader title="Ajukan Pembatalan" />
      <GlassCard>
        <Text className="text-xl font-black text-gray-950">Request Cancellation</Text>
        <Text className="mt-2 text-sm leading-5 text-gray-500">Pengajuan tidak menghapus catatan asli. Pembuat QR akan meninjau alasan Anda.</Text>
        <View className="mt-5 rounded-2xl bg-gray-50 p-4"><Text className="text-xs font-bold text-gray-500">Attendance Summary</Text><Text className="mt-2 text-sm font-black text-gray-900">Pelatihan Keberlanjutan Q3</Text><Text className="mt-1 text-xs text-gray-500">15 Agustus 2024 · 09:02 WIB · ABS-7K4P9X</Text><View className="mt-3"><Badge>Hadir</Badge></View></View>
        <Text className="mt-5 text-sm font-bold text-gray-800">Cancellation Details</Text>
        <TextInput multiline value={reason} onChangeText={setReason} className="mt-3 min-h-32 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900" placeholder="Tuliskan alasan pembatalan..." placeholderTextColor="#94A3B8" textAlignVertical="top" />
        <PrimaryButton className="mt-5" onPress={() => router.push("/screens/cancellation-submitted")}><ButtonText>Send Request</ButtonText></PrimaryButton>
        <SecondaryButton className="mt-3" onPress={() => router.back()}><Text className="text-sm font-bold text-gray-800">Cancel</Text></SecondaryButton>
      </GlassCard>
    </Screen>
  );
}

export function CancellationSubmittedScreen() {
  const router = useRouter();
  return (
    <Screen>
      <View className="items-center pt-5"><View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-50"><Text className="text-4xl text-emerald-600">✓</Text></View><Text className="mt-5 text-2xl font-black text-gray-950">Pengajuan Terkirim</Text><Text className="mt-2 text-center text-sm leading-5 text-gray-500">Permintaan pembatalan sudah dikirim kepada pembuat QR.</Text></View>
      <GlassCard><Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Detail Pengajuan</Text><Text className="mt-3 text-sm font-black text-gray-900">ABS-7K4P9X</Text><Badge tone="yellow">Menunggu keputusan</Badge><Text className="mt-3 text-xs leading-5 text-gray-500">Alasan tersimpan di audit trail dan tidak menghapus catatan absensi asli.</Text></GlassCard>
      <PrimaryButton onPress={() => router.push("/history")}><ButtonText>Kembali ke Riwayat</ButtonText></PrimaryButton>
    </Screen>
  );
}

export function CancellationApprovedScreen() {
  const router = useRouter();
  return (
    <Screen bottomNav="notifications">
      <BackHeader title="Status Pembatalan" />
      <GlassCard><Badge>Disetujui</Badge><Text className="mt-3 text-2xl font-black text-gray-950">Permintaan pembatalan disetujui</Text><Text className="mt-2 text-sm leading-5 text-gray-500">Status absensi berubah sesuai keputusan tanpa menghapus rekam audit.</Text></GlassCard>
      <GlassCard><Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Attendance Details</Text><RowButton icon="▣" title="event_note · Original Record" subtitle="ABS-7K4P9X · 15 Agustus 2024 · 09:02 WIB" trailing="" /><RowButton icon="↶" title="edit_note · Cancellation Request" subtitle="Disetujui oleh pembuat QR pada 15 Agustus 2024." trailing="" /></GlassCard>
      <PrimaryButton onPress={() => router.push("/history")}><ButtonText>Back to History</ButtonText></PrimaryButton>
    </Screen>
  );
}

export function CancellationRejectedScreen() {
  const router = useRouter();
  return (
    <Screen bottomNav="notifications">
      <BackHeader title="Status Pembatalan" />
      <GlassCard><Badge tone="red">Ditolak</Badge><Text className="mt-3 text-2xl font-black text-gray-950">Pengajuan pembatalan ditolak</Text><Text className="mt-2 text-sm leading-5 text-gray-500">Catatan absensi tetap tersimpan dengan jejak keputusan.</Text></GlassCard>
      <GlassCard><Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Detail Kehadiran</Text><Text className="mt-3 text-sm font-black text-gray-900">Pelatihan Keberlanjutan Q3</Text><Text className="mt-1 text-xs text-gray-500">ABS-7K4P9X · 15 Agustus 2024 · 09:02 WIB</Text><View className="my-4 border-t border-gray-100" /><Text className="text-xs font-bold text-gray-500">Alasan Penolakan</Text><Text className="mt-2 text-sm leading-5 text-gray-700">Data absensi masih dinilai valid dan sesuai dengan sesi.</Text></GlassCard>
      <SecondaryButton onPress={() => router.push("/history")}><Text className="text-sm font-bold text-gray-800">Kembali ke Riwayat</Text></SecondaryButton>
    </Screen>
  );
}

export function NotificationsScreen() {
  const router = useRouter();
  const [allRead, setAllRead] = useState(false);
  const items = [
    ["Absensi berhasil","Bukti ABS-7K4P9X siap dilihat.","2 menit lalu","green","✓"],
    ["QR Hampir Kedaluwarsa","Pelatihan Keberlanjutan Q3 berakhir dalam 30 menit.","25 menit lalu","yellow","◷"],
    ["Sinkronisasi","3 data offline tersinkronisasi.","Hari ini","green","↻"],
    ["Permintaan Pembatalan","Pengajuan Anda sedang ditinjau.","Kemarin","gray","↶"],
    ["QR Kedaluwarsa","Sesi Briefing Proyek Alpha sudah berakhir.","Kemarin","gray","×"]
  ] as const;
  return (
    <Screen bottomNav="notifications">
      <View className="flex-row items-center justify-between"><View><Text className="text-[28px] font-black text-gray-950">Notifikasi</Text><Text className="mt-1 text-sm text-gray-500">Pembaruan absensi dan QR Anda.</Text></View><Pressable onPress={() => setAllRead(true)}><Text className="text-xs font-bold text-emerald-600">Tandai semua dibaca</Text></Pressable></View>
      {items.map((i) => <Pressable key={i[0]} onPress={() => i[0] === "Absensi berhasil" && router.push("/screens/attendance-proof")} className={"rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm " + (allRead ? "opacity-70" : "")}><View className="flex-row"><View className={"h-10 w-10 items-center justify-center rounded-full " + (i[3] === "green" ? "bg-emerald-50" : i[3] === "yellow" ? "bg-amber-50" : "bg-gray-100")}><Text className="font-black text-gray-700">{i[4]}</Text></View><View className="ml-3 flex-1"><View className="flex-row items-start justify-between"><Text className="flex-1 text-sm font-black text-gray-900">{i[0]}</Text><Text className="ml-3 text-[10px] text-gray-400">{i[2]}</Text></View><Text className="mt-1 text-xs leading-5 text-gray-500">{i[1]}</Text></View></View></Pressable>)}
    </Screen>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const name = profile?.display_name || "Budi Santoso";
  const verified = Boolean(user?.email_confirmed_at);
  return (
    <Screen bottomNav="profile">
      <BackHeader title="Profil" right={<Pressable onPress={() => router.push("/profile-settings")}><Text className="text-lg text-gray-500">⚙</Text></Pressable>} />
      <GlassCard className="items-center">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-emerald-50"><Text className="text-3xl font-black text-emerald-700">{name.charAt(0)}</Text></View>
        <Text className="mt-4 text-xl font-black text-gray-950">{name}</Text>
        <Text className="mt-1 text-sm text-gray-500">{user?.email || "budi@example.com"}</Text>
        <Badge tone={verified ? "green" : "yellow"}>{verified ? "Email Terverifikasi" : "Email Belum Terverifikasi"}</Badge>
      </GlassCard>
      <GlassCard>
        <RowButton icon="person" title="Edit Profil" subtitle="Ubah data diri dan foto profil" onPress={() => router.push("/profile-settings")} />
        <RowButton icon="▣" title="Perangkat" subtitle="Kelola perangkat dan session aplikasi" trailing="›" />
        <RowButton icon="↪" title="Logout" subtitle="Keluar dari sesi saat ini" trailing="›" />
      </GlassCard>
    </Screen>
  );
}

export function ProfileSettingsScreen() {
  const router = useRouter();
  const { profile, user, updateDisplayName } = useAuth();
  const [name, setName] = useState(profile?.display_name || "Budi Santoso");
  const [saved, setSaved] = useState(false);
  return (
    <Screen>
      <BackHeader title="Pengaturan Profil" right={<Text className="text-lg text-gray-500">⚙</Text>} />
      <GlassCard className="items-center">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-50"><Text className="text-3xl font-black text-emerald-700">{name.charAt(0)}</Text></View>
        <Text className="mt-3 text-lg font-black text-gray-950">{name}</Text><Text className="mt-1 text-sm text-gray-500">{user?.email || "budi@example.com"}</Text>
        <Badge>{Boolean(user?.email_confirmed_at) ? "Terverifikasi" : "Belum Terverifikasi"}</Badge>
      </GlassCard>
      <GlassCard><Text className="text-base font-black text-gray-950">Edit Profil</Text><Text className="mt-3 text-xs font-semibold text-gray-500">Nama tampilan</Text><TextInput value={name} onChangeText={(v) => { setSaved(false); setName(v); }} className="mt-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900" /><PrimaryButton className="mt-3" onPress={async () => { await updateDisplayName(name); setSaved(true); }}><ButtonText>{saved ? "Tersimpan ✓" : "Simpan Perubahan"}</ButtonText></PrimaryButton></GlassCard>
      <GlassCard><Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Pengaturan Kehadiran</Text><RowButton icon="⌖" title="Pengaturan Lokasi" subtitle="Preferensi GPS dan validasi lokasi" trailing="›" /><RowButton icon="☼" title="Preferensi Aplikasi" subtitle="Notifikasi, tampilan, dan pengalaman" trailing="›" /></GlassCard>
      <GlassCard><Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Dukungan & Legal</Text><RowButton icon="?" title="Pusat Bantuan" trailing="›" /><RowButton icon="i" title="Kebijakan Privasi" trailing="›" /><RowButton icon="§" title="Syarat & Ketentuan" trailing="›" /></GlassCard>
      <DangerButton onPress={() => supabaseSignOut()}><Text className="font-bold text-red-700">Keluar Akun</Text></DangerButton>
      <TextButton onPress={() => router.replace("/profile")}>Kembali ke Profil</TextButton>
    </Screen>
  );
}

async function supabaseSignOut() {
  const { supabase } = await import("@/lib/supabase");
  await supabase.auth.signOut();
}

export function PermissionsAccessScreen() {
  const router = useRouter();
  return (
    <Screen scroll={false} contentClassName="justify-center px-6">
      <GlassCard className="w-full max-w-md self-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-50"><Text className="text-3xl text-emerald-600">✓</Text></View>
        <Text className="mt-4 text-2xl font-black text-gray-950">Enable Features</Text>
        <Text className="mt-2 text-sm leading-5 text-gray-500">Berikan akses kamera dan lokasi agar scanner dan verifikasi GPS bekerja sesuai pengaturan sesi.</Text>
        <View className="mt-5 gap-3"><RowButton icon="⌗" title="Camera Access" subtitle="Diperlukan untuk scan QR" /><RowButton icon="⌖" title="Precise Location" subtitle="Diperlukan saat GPS diaktifkan" /></View>
        <PrimaryButton className="mt-5" onPress={() => Linking.openSettings()}><ButtonText>Allow Permissions</ButtonText></PrimaryButton>
        <SecondaryButton className="mt-3" onPress={() => router.back()}><Text className="text-sm font-bold text-gray-800">Not Now</Text></SecondaryButton>
      </GlassCard>
    </Screen>
  );
}

export function PermissionNeededScreen() {
  const router = useRouter();
  return (
    <Screen scroll={false} contentClassName="justify-center px-6">
      <GlassCard className="w-full max-w-md self-center items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-amber-50"><Text className="text-3xl text-amber-600">!</Text></View>
        <Text className="mt-4 text-center text-2xl font-black text-gray-950">Permissions Needed</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-gray-500">Akses perangkat yang diperlukan belum diberikan, sehingga fitur tertentu tidak dapat digunakan.</Text>
        <PrimaryButton className="mt-5 w-full" onPress={() => Linking.openSettings()}><ButtonText>Open System Settings</ButtonText></PrimaryButton>
        <SecondaryButton className="mt-3 w-full" onPress={() => router.back()}><Text className="text-sm font-bold text-gray-800">Go Back</Text></SecondaryButton>
      </GlassCard>
    </Screen>
  );
}

export function NotificationsPermissionScreen() {
  const router = useRouter();
  return (
    <Screen scroll={false} contentClassName="justify-center px-6">
      <GlassCard className="w-full max-w-md self-center">
        <View className="items-center"><View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-50"><Text className="text-3xl text-emerald-600">◉</Text></View><Text className="mt-4 text-center text-2xl font-black text-gray-950">Stay Updated</Text><Text className="mt-2 text-center text-sm leading-5 text-gray-500">Aktifkan notifikasi untuk menerima pembaruan penting.</Text></View>
        <View className="mt-5"><RowButton icon="✓" title="Attendance Confirmation" subtitle="Beri tahu saat absensi berhasil atau tersinkronisasi." /><RowButton icon="↻" title="Sync Status" subtitle="Beri tahu saat sinkronisasi selesai atau tertunda." /><RowButton icon="◷" title="Schedule Changes" subtitle="Peringatan sesi dan QR yang hampir kedaluwarsa." /></View>
        <PrimaryButton className="mt-4" onPress={() => Linking.openSettings()}><ButtonText>Enable Notifications</ButtonText></PrimaryButton>
        <SecondaryButton className="mt-3" onPress={() => router.back()}><Text className="text-sm font-bold text-gray-800">Not Now</Text></SecondaryButton>
      </GlassCard>
    </Screen>
  );
}

export function SyncDataScreen() {
  const [filter, setFilter] = useState("Semua");
  const rows = [
    ["Check-in Proyek Bendungan","15 Agustus · 08:03","Menunggu sinkronisasi","yellow"],
    ["Laporan Inspeksi Harian","14 Agustus · 17:10","Tersinkronisasi","green"],
    ["Unggah Foto Lokasi","14 Agustus · 15:20","Sinkronisasi tertunda","yellow"],
    ["Check-out Kantor Pusat","13 Agustus · 17:05","Tersinkronisasi","green"]
  ] as const;
  return (
    <Screen>
      <BackHeader title="Sinkronisasi Data" />
      <GlassCard><Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Offline Queue</Text><Text className="mt-2 text-3xl font-black text-emerald-600">3</Text><Text className="mt-1 text-sm text-gray-500">data menunggu sinkronisasi</Text><ProgressBar value={72} /></GlassCard>
      <OfflineBanner text="Sinkronisasi tertunda tidak mengubah waktu scan asli. Data akan divalidasi server saat koneksi tersedia." />
      <Segmented items={["Semua","Tertunda","Selesai"]} value={filter} onChange={setFilter} />
      {rows.filter((r) => filter === "Semua" || (filter === "Selesai" ? r[3] === "green" : r[3] === "yellow")).map((r) => <GlassCard key={r[0]} className="p-4"><View className="flex-row items-start justify-between"><View className="flex-1"><Text className="text-sm font-black text-gray-900">{r[0]}</Text><Text className="mt-1 text-xs text-gray-500">{r[1]}</Text></View><Badge tone={r[3] === "green" ? "green" : "yellow"}>{r[2]}</Badge></View></GlassCard>)}
      <PrimaryButton><ButtonText>↻ Sinkronkan Sekarang</ButtonText></PrimaryButton>
    </Screen>
  );
}
