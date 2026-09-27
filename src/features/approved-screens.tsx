
import { useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import { useAuth } from "@/auth/auth-context";
import {
  Badge,
  BackHeader,

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
  StatCard
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
        <TextButton onPress={() => router.push("/forgot-password")}>Lupa Kata Sandi?</TextButton>
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
        <Pressable onPress={() => router.push("/screens/profile-settings")} className="h-11 w-11 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">
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
      <BackHeader
        title="Buat Sesi Absensi"
        right={
          <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full">
            <Text className="text-2xl text-gray-500">×</Text>
          </Pressable>
        }
      />

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-7 px-5 pb-7 pt-5"
        >
          <View className="gap-2">
            <Text className="text-sm font-bold text-gray-900">Judul Sesi</Text>
            <TextInput
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3.5 text-base text-gray-900"
              placeholder="Contoh: Rapat Tim Pagi"
              placeholderTextColor="#94A3B8"
              defaultValue="Pelatihan Keberlanjutan Q3"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-bold text-gray-900">Target Peserta</Text>
            <Segmented items={["Semua Pengguna", "Pengguna Tertentu"]} value={target} onChange={setTarget} />
          </View>

          <GlassCard className="gap-4 rounded-xl border-gray-200 p-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold text-gray-900">Durasi Sesi</Text>
              <Text className="text-sm font-semibold text-emerald-700">{duration} Jam</Text>
            </View>
            <RangeSlider value={duration} min={1} max={24} onChange={setDuration} />
            <View className="flex-row justify-between">
              <Text className="text-xs text-gray-400">1j</Text>
              <Text className="text-xs text-gray-400">12j</Text>
              <Text className="text-xs text-gray-400">24j</Text>
            </View>
          </GlassCard>

          <View className="gap-2">
            <Text className="text-sm font-bold text-gray-900">Batas Terlambat</Text>
            <View className="rounded-lg border border-gray-300 bg-transparent px-4 py-3.5">
              <Text className="text-base font-semibold text-gray-900">09:15</Text>
            </View>
            <Text className="text-xs leading-5 text-gray-500">
              Peserta yang memindai setelah waktu ini akan dicatat sebagai terlambat.
            </Text>
          </View>

          <GlassCard className="gap-5 rounded-xl border-gray-200 p-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-sm font-bold text-gray-900">GPS & Geofencing</Text>
                <Text className="mt-1 text-xs leading-5 text-gray-500">Batasi absensi pada lokasi tertentu.</Text>
              </View>
              <Switch
                value={gps}
                onValueChange={setGps}
                trackColor={{ false: "#E5E7EB", true: "#6EE7B7" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {gps ? (
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-gray-600">Radius yang diizinkan</Text>
                  <Text className="text-xs font-bold text-emerald-700">{radius} m</Text>
                </View>
                <RangeSlider value={radius} min={5} max={3000} onChange={setRadius} />
                <View className="relative h-48 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="h-40 w-40 rounded-full border-2 border-emerald-300/80 bg-emerald-200/30" />
                    <View className="absolute h-4 w-4 rounded-full bg-emerald-600" />
                  </View>
                  <View className="absolute inset-x-0 bottom-0 bg-white/80 px-4 py-3">
                    <Text className="text-xs font-semibold text-gray-700">Lokasi kantor saat ini</Text>
                    <Text className="mt-1 text-[11px] text-gray-500">Preview visual · integrasi peta menyusul.</Text>
                  </View>
                </View>
                <Text className="text-xs leading-5 text-gray-400">Menggunakan lokasi perangkat saat QR dibuat.</Text>
              </View>
            ) : (
              <OfflineBanner text="GPS nonaktif. QR tetap dapat dibuat; lokasi tidak digunakan saat validasi." />
            )}
          </GlassCard>
        </ScrollView>

        <View className="border-t border-emerald-900/10 bg-white px-5 py-3">
          <View className="flex-row gap-3">
            <SecondaryButton className="flex-1" onPress={() => router.back()}>
              <Text className="text-sm font-bold text-gray-800">Batal</Text>
            </SecondaryButton>
            <PrimaryButton className="flex-[1.4]" onPress={() => router.push("/screens/confirm-qr")}>
              <View className="flex-row items-center gap-2">
                <Text className="text-lg text-white">▦</Text>
                <ButtonText>Generate QR</ButtonText>
              </View>
            </PrimaryButton>
          </View>
        </View>
      </View>
    </Screen>
  );
}

function RangeSlider({
  value,
  min,
  max,
  onChange
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <Pressable
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      onPress={(event) => {
        const x = event.nativeEvent.locationX;
        const next = min + (x / Math.max(trackWidth, 1)) * (max - min);
        onChange(Math.max(min, Math.min(max, Math.round(next))));
      }}
      className="relative h-6 w-full justify-center"
    >
      <View className="absolute inset-x-0 h-1 rounded-full bg-gray-300" />
      <View className="absolute left-0 h-1 rounded-full bg-emerald-700" style={{ width: `${percentage}%` }} />
      <View
        className="absolute h-5 w-5 rounded-full border-2 border-white bg-emerald-700 shadow-sm"
        style={{ left: `${percentage}%`, marginLeft: -10 }}
      />
    </Pressable>
  );
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
    <Screen>
      <View className="flex-1 items-center justify-center px-0 py-4">
        <GlassCard className="w-full items-center rounded-xl border-gray-200 p-6">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
            <Text className="text-5xl text-emerald-600">✓</Text>
          </View>

          <Text className="text-center text-2xl font-semibold text-emerald-800">
            QR Berhasil Dibuat!
          </Text>
          <Text className="mt-2 text-center text-sm leading-6 text-gray-500">
            Sesi absensi siap digunakan. Peserta dapat mulai memindai kode ini.
          </Text>

          <View className="mt-6 w-full items-center rounded-xl bg-gray-50 p-5">
            <QrVisual size={192} label="QR AKTIF" />
            <View className="mt-4 flex-row items-center gap-2">
              <Text className="text-sm text-emerald-700">◷</Text>
              <Text className="text-xs font-semibold text-emerald-700">
                Token diperbarui setiap 10 menit
              </Text>
            </View>
          </View>

          <View className="mt-6 w-full gap-3">
            <PrimaryButton>
              <View className="flex-row items-center gap-2">
                <Text className="text-lg text-white">↗</Text>
                <ButtonText>Share QR</ButtonText>
              </View>
            </PrimaryButton>

            <SecondaryButton>
              <View className="flex-row items-center gap-2">
                <Text className="text-lg text-emerald-700">↓</Text>
                <Text className="text-sm font-bold text-emerald-800">Download as Image</Text>
              </View>
            </SecondaryButton>

            <Pressable
              onPress={() => router.push("/history")}
              className="min-h-12 items-center justify-center rounded-2xl px-5 py-3.5"
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-lg text-gray-500">◷</Text>
                <Text className="text-sm font-bold text-gray-600">View Session History</Text>
              </View>
            </Pressable>
          </View>
        </GlassCard>
      </View>
    </Screen>
  );
}

export function ActiveQrScreen() {
  const router = useRouter();

  return (
    <Screen>
      <BackHeader
        title="Detail Sesi QR"
        right={
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-gray-50">
            <Text className="text-lg text-gray-600">⋮</Text>
          </Pressable>
        }
      />

      <View className="gap-2">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-2xl font-semibold text-emerald-800">
              Pelatihan Keberlanjutan Q3
            </Text>
            <Text className="mt-2 text-sm text-gray-500">
              ◷ 15 Agustus 2024, 09:00 WIB
            </Text>
          </View>

          <Badge>Aktif</Badge>
        </View>

        <View className="items-end">
          <Text className="text-xs font-semibold text-gray-500">Berakhir dalam</Text>
          <Text className="mt-1 text-2xl font-bold tracking-tight text-emerald-800">
            02:45:12
          </Text>
        </View>
      </View>

      <GlassCard className="items-center rounded-xl border-gray-200 p-5">
        <Text className="text-lg font-semibold text-emerald-800">Pindai untuk Hadir</Text>

        <View className="relative mt-5 items-center justify-center rounded-lg border-2 border-emerald-100 bg-white p-4">
          <QrVisual size={256} label="TOKEN DINAMIS" />
          <View className="absolute left-4 right-4 top-4 h-1 rounded-full bg-emerald-300/70" />
        </View>

        <View className="mt-5 w-full">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-gray-500">Token dinamis</Text>
            <Text className="text-sm font-bold text-emerald-800">08:45</Text>
          </View>
          <View className="mt-2">
            <ProgressBar value={85} />
          </View>
          <Text className="mt-2 text-center text-xs text-gray-400">
            QR Code diperbarui otomatis untuk keamanan.
          </Text>
        </View>
      </GlassCard>

      <View className="flex-row gap-3">
        <SecondaryButton className="flex-1">
          <Text className="text-sm font-bold text-emerald-800">↗ Share QR</Text>
        </SecondaryButton>
        <SecondaryButton className="flex-1">
          <Text className="text-sm font-bold text-emerald-800">↓ Download Image</Text>
        </SecondaryButton>
      </View>

      <GlassCard className="rounded-xl border-gray-200 bg-gray-50 p-5">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-gray-500">
          Status Kehadiran
        </Text>
        <View className="mt-2 flex-row items-end">
          <Text className="text-5xl font-bold text-emerald-800">42</Text>
          <Text className="mb-1 ml-2 text-base text-gray-500">/ 50 Peserta</Text>
        </View>
        <PrimaryButton className="mt-4" onPress={() => router.push("/screens/history-session")}>
          <View className="flex-row items-center gap-2">
            <ButtonText>Lihat Riwayat Kehadiran</ButtonText>
            <Text className="text-base text-white">→</Text>
          </View>
        </PrimaryButton>
      </GlassCard>

      <View className="h-32 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        <View className="flex-1 items-center justify-center">
          <View className="h-28 w-28 rounded-full border-2 border-emerald-300/70 bg-emerald-200/25" />
          <View className="absolute h-4 w-4 rounded-full bg-emerald-700" />
          <View className="absolute inset-x-0 bottom-0 bg-white/85 px-4 py-3">
            <Text className="text-xs font-semibold text-gray-700">Ruang Auditorium Utama</Text>
          </View>
        </View>
      </View>

      <GlassCard className="overflow-hidden rounded-xl border-gray-200 p-0">
        <RowButton icon="✎" title="Edit Detail Sesi" trailing="›" />
        <RowButton icon="⌖" title="Pengaturan Batasan Wilayah" trailing="›" />
      </GlassCard>

      <DangerButton onPress={() => router.push("/screens/expired-qr")}>
        <View className="flex-row items-center gap-2">
          <Text className="text-lg text-red-700">⌫</Text>
          <Text className="font-bold text-red-700">Hapus Sesi</Text>
        </View>
      </DangerButton>
    </Screen>
  );
}

export function ExpiredQrScreen() {
  const router = useRouter();

  return (
    <Screen>
      <BackHeader title="Detail Sesi" />

      <View className="items-center pt-3">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <Text className="text-3xl text-gray-500">×</Text>
        </View>
        <Text className="mt-5 text-2xl font-semibold text-gray-950">QR Kedaluwarsa</Text>
        <View className="mt-2">
          <Badge tone="gray">Kedaluwarsa</Badge>
        </View>
      </View>

      <GlassCard className="rounded-xl border-gray-200">
        <Text className="text-base font-semibold text-gray-900">Pelatihan Keberlanjutan Q3</Text>
        <Text className="mt-2 text-sm text-gray-500">Berakhir 15 Agustus 2024 · 17:00 WIB</Text>

        <View className="mt-5 items-center rounded-xl bg-gray-50 p-4">
          <QrVisual size={190} label="ARSIP" />
        </View>

        <Text className="mt-5 text-sm leading-6 text-gray-600">
          Sesi sudah tidak dapat digunakan untuk absensi. Riwayat tetap tersimpan sebagai arsip.
        </Text>
      </GlassCard>

      <PrimaryButton onPress={() => router.push("/history")}>
        <ButtonText>Lihat Riwayat</ButtonText>
      </PrimaryButton>

      <DangerButton>
        <Text className="font-bold text-red-700">Hapus dari daftar saya</Text>
      </DangerButton>
    </Screen>
  );
}


