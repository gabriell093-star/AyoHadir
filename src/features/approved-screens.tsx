
import { useEffect, useState } from "react";
import { ActivityIndicator, AppState, Image, Linking, Modal, PanResponder, Platform, Pressable, ScrollView, Switch, Text, TextInput, View, type DimensionValue } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "@/auth/auth-context";
import { supabase } from "@/lib/supabase";
import {
  AyoHadirLogo,
  AppIcon,
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

function TextButton({ children, onPress, tone = "green" }: { children: string; onPress?: () => void; tone?: "green" | "gray" | "red" }) {
  return (
    <Pressable onPress={onPress}>
      <Text className={"text-sm font-bold " + (tone === "green" ? "text-[#3E5219]" : tone === "red" ? "text-red-600" : "text-gray-600")}>{children}</Text>
    </Pressable>
  );
}

function Brand() {
  return (
    <View className="items-center">
      <AyoHadirLogo size={78} />
      <Text className="mt-3 text-[28px] font-black tracking-tight text-[#3E5219]">AyoHadir!</Text>
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
      <View className="absolute inset-0 bg-[#F2F5E8] opacity-60" />
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
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      try {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 4500)
        );
        const response = await Promise.race([
          fetch("https://sqrvntrxoytjnbgticpd.supabase.co/auth/v1/health"),
          timeout
        ]);
        if (mounted) setOnline(response instanceof Response ? response.ok || response.status < 500 : false);
      } catch {
        if (mounted) setOnline(false);
      }
    };

    void checkConnection();
    const interval = setInterval(checkConnection, 15000);
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void checkConnection();
      }
    });

    return () => {
      mounted = false;
      clearInterval(interval);
      appState.remove();
    };
  }, []);

  const activities = [
    { title: "Rapat Tim", meta: "Hadir · 08:00", icon: "✓" },
    { title: "Shift Pagi", meta: "Hadir · Kemarin", icon: "✓" },
    { title: "Seminar", meta: "Terlambat · 2 Hari lalu", icon: "!" }
  ];

  const onlineLabel = online === null ? "Mengecek koneksi…" : online ? "Online" : "Offline";

  return (
    <Screen bottomNav="home">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[28px] font-black text-gray-950">Halo, {displayName} 👋</Text>
          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            <Badge tone={verified ? "green" : "yellow"}>{verified ? "✓ Email Terverifikasi" : "Email Belum Terverifikasi"}</Badge>
            <Badge tone={online ? "green" : online === false ? "gray" : "yellow"}>{onlineLabel}</Badge>
          </View>
        </View>
        <Pressable onPress={() => router.push("/screens/profile-settings")} className="h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white">
          <AppIcon name="settings" size={21} color="#3E5219" />
        </Pressable>
      </View>

      <SoftCard className="overflow-hidden p-0">
        <View className="flex-row items-start justify-between px-5 pt-5">
          <View className="flex-1">
            <Text className="text-xs font-black uppercase tracking-[2px] text-[#3E5219]">Siap absen?</Text>
            <Text className="mt-2 text-[23px] font-black leading-7 text-gray-950">Pindai QR dan konfirmasi kehadiran.</Text>
            <Text className="mt-2 text-sm leading-5 text-gray-600">Kamera memindai QR secara langsung, lalu sistem memeriksa sesi, akun, waktu, target pengguna, dan GPS bila diaktifkan.</Text>
          </View>
          <View className="ml-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#E4F1D2]">
            <AppIcon name="qr_code_scanner" size={25} color="#3E5219" />
          </View>
        </View>
        <View className="px-5 pb-5 pt-4">
          <PrimaryButton onPress={() => router.push("/screens/scan-qr")}>
            <View className="flex-row items-center gap-2"><AppIcon name="qr_code_scanner" size={19} color="#FFFFFF" /><ButtonText>Quick Scan</ButtonText></View>
          </PrimaryButton>
        </View>
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
            <AppIcon name="more_vert" size={20} color="#75796B" />
          </View>
          <Text className="mt-3 text-base font-extrabold text-gray-900">{item[0]}</Text>
          <View className="mt-1 flex-row items-center gap-2">
            <AppIcon name="schedule" size={16} color="#75796B" />
            <Text className="text-xs text-gray-500">{item[1]}</Text>
          </View>
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
        <Pressable onPress={() => router.push("/screens/create-session")} className="mt-5 flex-row items-center rounded-2xl bg-[#3E5219] px-4 py-4">
          <Text className="mr-3 text-2xl text-white">▦</Text><View className="flex-1"><Text className="font-black text-white">Buat QR</Text><Text className="mt-1 text-xs text-[#F2F5E8]">Buat sesi absensi baru.</Text></View><Text className="text-xl text-white">→</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/screens/scan-qr")} className="mt-3 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4">
          <Text className="mr-3 text-2xl text-[#3E5219]">⌗</Text><View className="flex-1"><Text className="font-black text-gray-900">Scan QR</Text><Text className="mt-1 text-xs text-gray-500">Buka scanner kamera.</Text></View><Text className="text-xl text-gray-300">→</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

export function CreateSessionScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("Pelatihan Keberlanjutan Q3");
  const [target, setTarget] = useState("Semua Pengguna");
  const [duration, setDuration] = useState(8);
  const [lateMinutes, setLateMinutes] = useState(15);
  const [gps, setGps] = useState(true);
  const [radius, setRadius] = useState(150);

  const clampDuration = (next: number) => setDuration(Math.max(1, Math.min(24, next)));
  const clampRadius = (next: number) => setRadius(Math.max(5, Math.min(3000, next)));

  const generate = () => {
    router.push({
      pathname: "/screens/confirm-qr",
      params: {
        title: title.trim() || "Sesi Absensi",
        target,
        duration: String(duration),
        lateMinutes: String(lateMinutes),
        gps: String(gps),
        radius: String(radius)
      }
    });
  };

  return (
    <Screen scroll={false}>
      <BackHeader title="Buat Sesi Absensi" />

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-4 px-5 pb-7 pt-4"
        >
          <View className="flex-row items-center gap-2">
            {["Info Dasar","Waktu","Lokasi","Review"].map((label, index) => (
              <View key={label} className="flex-1">
                <View className={"h-1.5 rounded-full " + (index < 3 ? "bg-[#3E5219]" : "bg-[#C5C8B8]/40")} />
                <Text className={"mt-2 text-[10px] font-bold " + (index === 0 ? "text-[#3E5219]" : "text-gray-400")}>{label}</Text>
              </View>
            ))}
          </View>

          <SoftCard className="overflow-hidden p-5">
            <View className="flex-row items-start">
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#E4F1D2]">
                <AppIcon name="qr_code_2" size={25} color="#3E5219" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-black uppercase tracking-[2px] text-[#3E5219]">Sesi baru</Text>
                <Text className="mt-1 text-lg font-black text-gray-950">Atur sekali, lalu QR siap dibagikan.</Text>
                <Text className="mt-1 text-xs leading-5 text-gray-600">Pengaturan ini akan dibawa ke halaman konfirmasi supaya tidak ada nilai yang hilang.</Text>
              </View>
            </View>
          </SoftCard>

          <GlassCard className="p-5">
            <SectionTitle title="1. Info Dasar" />
            <View className="mt-4 gap-2">
              <Text className="text-sm font-bold text-gray-900">Judul Sesi</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                className="w-full rounded-2xl border border-[#C5C8B8] bg-[#FAF9F6] px-4 py-3.5 text-base text-gray-900"
                placeholder="Contoh: Rapat Tim Pagi"
                placeholderTextColor="#8A8D82"
              />
            </View>

            <View className="mt-5 gap-2">
              <Text className="text-sm font-bold text-gray-900">Target Peserta</Text>
              <Segmented items={["Semua Pengguna", "Pengguna Tertentu"]} value={target} onChange={setTarget} />
            </View>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionTitle title="2. Waktu" />
            <Text className="mt-4 text-xs font-semibold text-gray-500">Durasi sesi</Text>

            <View className="mt-3 flex-row items-center rounded-2xl bg-[#F4F3F1] p-1">
              <Pressable onPress={() => clampDuration(duration - 1)} className="h-12 w-12 items-center justify-center rounded-xl bg-white">
                <Text className="text-2xl font-light text-[#3E5219]">−</Text>
              </Pressable>
              <View className="flex-1 items-center">
                <Text className="text-[24px] font-black text-[#3E5219]">{duration}</Text>
                <Text className="text-[10px] font-bold uppercase tracking-[1px] text-gray-500">jam</Text>
              </View>
              <Pressable onPress={() => clampDuration(duration + 1)} className="h-12 w-12 items-center justify-center rounded-xl bg-white">
                <Text className="text-2xl font-light text-[#3E5219]">+</Text>
              </Pressable>
            </View>

            <View className="mt-3 flex-row flex-wrap gap-2">
              {[1,2,4,8,12,24].map((hours) => (
                <Pressable
                  key={hours}
                  onPress={() => setDuration(hours)}
                  className={"rounded-full border px-4 py-2.5 " + (duration === hours ? "border-[#3E5219] bg-[#3E5219]" : "border-[#C5C8B8] bg-white")}
                >
                  <Text className={"text-xs font-bold " + (duration === hours ? "text-white" : "text-[#45483C]")}>{hours} jam</Text>
                </Pressable>
              ))}
            </View>

            <View className="mt-5 gap-2">
              <Text className="text-xs font-semibold text-gray-500">Batas terlambat</Text>
              <View className="flex-row flex-wrap gap-2">
                {[10,15,30,60].map((minutes) => (
                  <Pressable
                    key={minutes}
                    onPress={() => setLateMinutes(minutes)}
                    className={"rounded-full border px-4 py-2.5 " + (lateMinutes === minutes ? "border-[#3E5219] bg-[#3E5219]" : "border-[#C5C8B8] bg-white")}
                  >
                    <Text className={"text-xs font-bold " + (lateMinutes === minutes ? "text-white" : "text-[#45483C]")}>{minutes} menit</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionTitle title="3. Lokasi" />
            <View className="mt-4 flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-sm font-bold text-gray-900">GPS & Geofencing</Text>
                <Text className="mt-1 text-xs leading-5 text-gray-500">Batasi absensi pada radius lokasi perangkat saat QR dibuat.</Text>
              </View>
              <Switch
                value={gps}
                onValueChange={setGps}
                trackColor={{ false: "#D9DCD1", true: "#879B5A" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {gps ? (
              <View className="mt-5 gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-gray-600">Radius yang diizinkan</Text>
                  <Text className="text-xs font-black text-[#3E5219]">{radius} m</Text>
                </View>
                <RangeSlider value={radius} min={5} max={3000} onChange={setRadius} />
                <View className="flex-row items-center gap-2">
                  <Pressable onPress={() => clampRadius(radius - (radius > 500 ? 100 : 25))} className="flex-1 rounded-xl border border-[#C5C8B8] bg-white px-3 py-3">
                    <Text className="text-center text-xs font-bold text-[#3E5219]">− Kurangi</Text>
                  </Pressable>
                  <Pressable onPress={() => clampRadius(radius + (radius >= 500 ? 100 : 25))} className="flex-1 rounded-xl border border-[#C5C8B8] bg-white px-3 py-3">
                    <Text className="text-center text-xs font-bold text-[#3E5219]">Tambah +</Text>
                  </Pressable>
                </View>
                <View className="relative h-44 overflow-hidden rounded-2xl border border-[#C5C8B8] bg-[#F4F3F1]">
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="h-36 w-36 rounded-full border-2 border-[#9CAE70] bg-[#E4F1D2]/60" />
                    <View className="absolute h-4 w-4 rounded-full bg-[#3E5219]" />
                  </View>
                  <View className="absolute inset-x-0 bottom-0 bg-white/90 px-4 py-3">
                    <Text className="text-xs font-semibold text-gray-700">Lokasi perangkat saat ini</Text>
                    <Text className="mt-1 text-[11px] text-gray-500">Radius {radius} m · preview visual.</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="mt-4">
                <OfflineBanner text="GPS nonaktif. QR tetap dapat dibuat, tetapi lokasi tidak digunakan saat validasi." />
              </View>
            )}
          </GlassCard>

          <View className="rounded-2xl border border-[#C5C8B8] bg-white p-4">
            <View className="flex-row items-start gap-3">
              <AppIcon name="verified" size={20} color="#3E5219" />
              <View className="flex-1">
                <Text className="text-sm font-black text-gray-900">Pengaturan tersimpan di langkah berikutnya</Text>
                <Text className="mt-1 text-xs leading-5 text-gray-500">Sebelum QR dibuat, Anda akan melihat kembali judul, durasi, batas terlambat, target, dan GPS.</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="border-t border-[#C5C8B8]/50 bg-[#FAF9F6] px-5 pb-3 pt-3">
          <View className="flex-row gap-3">
            <SecondaryButton className="flex-1" onPress={() => router.back()}>
              <Text className="text-sm font-bold text-[#45483C]">Batal</Text>
            </SecondaryButton>
            <PrimaryButton className="flex-[1.4]" onPress={generate}>
              <View className="flex-row items-center gap-2"><AppIcon name="qr_code_2" size={19} color="#FFFFFF" /><ButtonText>Review QR</ButtonText></View>
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
  const [trackWidth, setTrackWidth] = useState(1);

  const updateFromX = (x: number) => {
    const clamped = Math.max(0, Math.min(trackWidth, x));
    const ratio = clamped / Math.max(trackWidth, 1);
    const next = min + ratio * (max - min);
    onChange(Math.max(min, Math.min(max, Math.round(next))));
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => updateFromX(event.nativeEvent.locationX),
    onPanResponderMove: (event) => updateFromX(event.nativeEvent.locationX),
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true
  });

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <Pressable
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      className="h-8 w-full justify-center"
      {...panResponder.panHandlers}
    >
      <View className="absolute inset-x-0 h-1.5 rounded-full bg-[#D7D8CF]" />
      <View className="absolute left-0 h-1.5 rounded-full bg-[#3E5219]" style={{ width: (percentage + "%") as DimensionValue }} />
      <View className="absolute h-6 w-6 rounded-full border-2 border-white bg-[#3E5219] shadow-sm" style={{ left: (percentage + "%") as DimensionValue, marginLeft: -12 }} />
    </Pressable>
  );
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(1);

  const updateFromX = (x: number) => {
    const clamped = Math.max(0, Math.min(trackWidth, x));
    const ratio = clamped / Math.max(trackWidth, 1);
    const next = min + ratio * (max - min);
    onChange(Math.max(min, Math.min(max, Math.round(next))));
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => updateFromX(event.nativeEvent.locationX),
    onPanResponderMove: (event) => updateFromX(event.nativeEvent.locationX)
  });

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      className="h-8 w-full justify-center"
      {...panResponder.panHandlers}
    >
      <View className="absolute inset-x-0 h-1.5 rounded-full bg-[#D7D8CF]" />
      <View
        className="absolute left-0 h-1.5 rounded-full bg-[#3E5219]"
        style={{ width: (percentage + "%") as DimensionValue }}
      />
      <View
        className="absolute h-6 w-6 rounded-full border-2 border-white bg-[#3E5219] shadow-sm"
        style={{ left: (percentage + "%") as DimensionValue, marginLeft: -12 }}
      />
    </View>
  );
}

export function ConfirmQrScreen() {
  const router = useRouter();
  const params = require("expo-router").useLocalSearchParams<{
    title?: string;
    target?: string;
    duration?: string;
    lateMinutes?: string;
    gps?: string;
    radius?: string;
  }>();

  const title = params.title || "Sesi Absensi";
  const target = params.target || "Semua Pengguna";
  const duration = Number(params.duration || 8);
  const lateMinutes = Number(params.lateMinutes || 15);
  const gps = params.gps === "true";
  const radius = Number(params.radius || 150);

  return (
    <Screen>
      <BackHeader title="Konfirmasi QR" />
      <SoftCard>
        <Text className="text-xs font-bold uppercase tracking-[2px] text-[#3E5219]">Review Sebelum Dibuat</Text>
        <Text className="mt-2 text-[24px] font-black text-gray-950">{title}</Text>
        <Text className="mt-2 text-sm leading-5 text-gray-500">Pastikan pengaturan di bawah sudah sesuai. Tidak ada nilai yang kembali ke default.</Text>
      </SoftCard>
      <GlassCard>
        {[
          ["Judul", title],
          ["Target", target],
          ["Durasi", duration + " jam"],
          ["Batas terlambat", lateMinutes + " menit"],
          ["GPS", gps ? "Aktif · radius " + radius + " m" : "Nonaktif"]
        ].map((x) => (
          <View key={x[0]} className="flex-row justify-between gap-4 border-b border-gray-100 py-3 first:pt-0">
            <Text className="text-xs font-semibold text-gray-500">{x[0]}</Text>
            <Text className="max-w-[68%] text-right text-sm font-bold text-gray-900">{x[1]}</Text>
          </View>
        ))}
        <PrimaryButton
          className="mt-5"
          onPress={() => router.push({
            pathname: "/screens/qr-success",
            params: { title, target, duration: String(duration), gps: String(gps), radius: String(radius), lateMinutes: String(lateMinutes) }
          })}
        >
          <View className="flex-row items-center gap-2"><AppIcon name="qr_code_2" size={19} color="#FFFFFF" /><ButtonText>Konfirmasi & Buat QR</ButtonText></View>
        </PrimaryButton>
        <SecondaryButton className="mt-3" onPress={() => router.back()}><Text className="text-sm font-bold text-[#45483C]">Edit Pengaturan</Text></SecondaryButton>
      </GlassCard>
    </Screen>
  );
}

export function QrSuccessScreen() {
  const router = useRouter();
  const params = require("expo-router").useLocalSearchParams<{
    title?: string;
    target?: string;
    duration?: string;
    gps?: string;
    radius?: string;
    lateMinutes?: string;
  }>();

  const title = params.title || "Sesi Absensi";
  const duration = Number(params.duration || 8);
  const gps = params.gps === "true";
  const radius = Number(params.radius || 150);

  return (
    <Screen bottomNav="home">
      <View className="items-center pt-3">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-[#F2F5E8]"><AppIcon name="check_circle" size={42} color="#3E5219" /></View>
        <Text className="mt-5 text-center text-2xl font-black text-gray-950">QR Berhasil Dibuat!</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-gray-500">Sesi sudah terdaftar dan siap digunakan.</Text>
      </View>

      <GlassCard className="items-center">
        <View className="w-full flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-base font-black text-gray-900">{title}</Text>
            <Text className="mt-1 text-xs text-gray-500">{duration} jam · {gps ? "GPS aktif" : "GPS nonaktif"}</Text>
          </View>
          <Badge>Aktif</Badge>
        </View>
        <View className="mt-5"><QrVisual size={210} label="QR AKTIF" value={"ayohadir:" + title + ":" + Date.now()} /></View>
        <Text className="mt-4 text-center text-xs leading-5 text-gray-500">Bagikan atau unduh QR. QR di atas adalah representasi visual untuk tahap ini; validasi token server menjadi langkah berikutnya.</Text>
      </GlassCard>

      <View className="flex-row gap-3">
        <SecondaryButton className="flex-1"><View className="flex-row items-center gap-2"><AppIcon name="share" size={18} color="#3E5219" /><Text className="text-sm font-bold text-[#45483C]">Bagikan</Text></View></SecondaryButton>
        <SecondaryButton className="flex-1"><View className="flex-row items-center gap-2"><AppIcon name="download" size={18} color="#3E5219" /><Text className="text-sm font-bold text-[#45483C]">Unduh</Text></View></SecondaryButton>
      </View>

      <GlassCard>
        <Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Ringkasan</Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          <Badge>{duration} jam</Badge>
          <Badge>{gps ? "GPS " + radius + " m" : "GPS mati"}</Badge>
          <Badge tone="gray">Token visual</Badge>
        </View>
      </GlassCard>

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
        <View className="flex-1"><Text className="text-2xl font-black text-[#3E5219]">Pelatihan Keberlanjutan Q3</Text><MiniCalendar date="15 Agustus 2024 · 09:00 WIB" /></View>
        <Badge>Aktif</Badge>
      </View>
      <GlassCard className="items-center">
        <Text className="text-lg font-black text-gray-900">Pindai untuk Hadir</Text>
        <View className="mt-5"><QrVisual size={232} label="TOKEN DINAMIS" /></View>
        <View className="mt-5 w-full"><View className="flex-row justify-between"><Text className="text-xs text-gray-500">Token dinamis</Text><Text className="text-xs font-bold text-[#3E5219]">08:45</Text></View><ProgressBar value={85}/><Text className="mt-2 text-center text-[11px] text-gray-400">QR Code diperbarui otomatis untuk keamanan.</Text></View>
      </GlassCard>
      <View className="flex-row gap-3"><SecondaryButton className="flex-1"><Text className="text-sm font-bold text-gray-800">↗ Bagikan QR</Text></SecondaryButton><SecondaryButton className="flex-1"><Text className="text-sm font-bold text-gray-800">↓ Download</Text></SecondaryButton></View>
      <GlassCard>
        <Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Status Kehadiran</Text>
        <View className="mt-2 flex-row items-end"><Text className="text-4xl font-black text-[#3E5219]">42</Text><Text className="mb-1 ml-2 text-sm text-gray-500">/ 50 peserta</Text></View>
        <PrimaryButton className="mt-4" onPress={() => router.push("/screens/history-session")}><ButtonText>Lihat Riwayat Kehadiran →</ButtonText></PrimaryButton>
      </GlassCard>
      <View className="h-32 items-center justify-center rounded-2xl bg-[#F2F5E8]"><Text className="text-3xl text-[#3E5219]">⌖</Text><Text className="mt-2 text-xs font-semibold text-gray-600">Ruang Auditorium Utama · GPS 150 m</Text></View>
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
        {rows.filter((r) => filter === "Semua" || r[2] === filter).map((r) => <View key={r[0]} className="flex-row items-center border-b border-gray-100 py-3"><View className="h-9 w-9 items-center justify-center rounded-full bg-[#F2F5E8]"><Text className="text-sm font-black text-[#3E5219]">{r[0].charAt(0)}</Text></View><View className="ml-3 flex-1"><Text className="text-sm font-bold text-gray-900">{r[0]}</Text><Text className="mt-1 text-[11px] text-gray-500">{r[3]}</Text></View><View className="items-end"><Badge tone={r[2] === "Hadir" ? "green" : r[2] === "Terlambat" ? "yellow" : "gray"}>{r[2]}</Badge><Text className="mt-1 text-[10px] text-gray-400">{r[1]}</Text></View></View>)}
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
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleBarcode = ({ data }: { data: string }) => {
    if (scanned || galleryBusy) return;
    setScanned(true);
    router.push({
      pathname: "/screens/attendance-success",
      params: { qr: data }
    });
  };

  const scanFromGallery = async () => {
    if (galleryBusy || scanned) return;
    setMessage(null);
    setGalleryBusy(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1
      });

      if (result.canceled || !result.assets[0]) return;

      const [match] = await Camera.scanFromURLAsync(result.assets[0].uri, ["qr"]);
      if (!match?.data) {
        setMessage("QR tidak ditemukan pada gambar. Pilih foto yang menampilkan kode QR dengan jelas.");
        return;
      }

      handleBarcode({ data: match.data });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gambar tidak dapat dipindai.");
    } finally {
      setGalleryBusy(false);
    }
  };

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-[#091426]">
        <StatusBar style="light" />
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text className="mt-4 text-sm text-white/70">Menyiapkan kamera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-[#091426] px-6">
        <StatusBar style="light" />
        <View className="w-full rounded-3xl border border-white/10 bg-white/10 p-6">
          <View className="items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#E4F1D2]">
              <AppIcon name="camera_alt" size={28} color="#3E5219" />
            </View>
            <Text className="mt-4 text-center text-2xl font-black text-white">Izin Kamera</Text>
            <Text className="mt-2 text-center text-sm leading-6 text-white/70">Izinkan kamera agar AyoHadir dapat membaca QR secara langsung.</Text>
          </View>
          <PrimaryButton className="mt-5" onPress={requestPermission}><ButtonText>Izinkan Kamera</ButtonText></PrimaryButton>
          <SecondaryButton className="mt-3 border-white/15 bg-white/5" onPress={() => router.back()}><Text className="text-sm font-bold text-white">Kembali</Text></SecondaryButton>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        active
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarcode}
        onMountError={(event) => setCameraError(event.message)}
      >
        <View className="flex-1 bg-black/25">
          <View className="flex-row items-center justify-between px-4 pt-3">
            <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-[#091426]/65">
              <AppIcon name="arrow_back" size={22} color="#FFFFFF" />
            </Pressable>
            <View className="rounded-full bg-[#091426]/65 px-4 py-2">
              <Text className="text-base font-bold text-white">Pindai QR</Text>
            </View>
            <View className="flex-row items-center rounded-full bg-[#091426]/65 px-3 py-2">
              <View className="mr-2 h-2 w-2 rounded-full bg-[#B9C99A]" />
              <Text className="text-xs font-bold text-white">Kamera aktif</Text>
            </View>
          </View>

          <View className="flex-1 items-center justify-center px-6">
            <View className="relative h-[300px] w-[300px]">
              <View className="absolute left-0 top-0 h-12 w-12 rounded-tl-3xl border-l-4 border-t-4 border-[#B9C99A]" />
              <View className="absolute right-0 top-0 h-12 w-12 rounded-tr-3xl border-r-4 border-t-4 border-[#B9C99A]" />
              <View className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-3xl border-b-4 border-l-4 border-[#B9C99A]" />
              <View className="absolute bottom-0 right-0 h-12 w-12 rounded-br-3xl border-b-4 border-r-4 border-[#B9C99A]" />
              <View className="absolute left-3 right-3 top-1/2 h-0.5 bg-[#B9C99A]/80" />
            </View>

            <Text className="mt-8 text-center text-base font-semibold text-white">Posisikan kode QR di dalam bingkai</Text>
            <Text className="mt-2 text-center text-xs leading-5 text-white/65">Anda juga dapat memilih screenshot atau foto QR dari galeri.</Text>

            {cameraError ? (
              <View className="mt-4 rounded-2xl bg-red-500/20 px-4 py-3">
                <Text className="text-center text-xs leading-5 text-red-100">Kamera gagal dimuat: {cameraError}</Text>
              </View>
            ) : null}

            {message ? (
              <View className="mt-4 rounded-2xl bg-amber-500/20 px-4 py-3">
                <Text className="text-center text-xs leading-5 text-amber-100">{message}</Text>
              </View>
            ) : null}
          </View>

          <View className="mb-7 px-6">
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setTorch((value) => !value)}
                className="flex-1 items-center rounded-2xl border border-white/15 bg-black/50 px-4 py-3.5"
              >
                <View className="flex-row items-center gap-2"><AppIcon name="flash_on" size={20} color={torch ? "#B9C99A" : "#FFFFFF"} /><Text className="text-xs font-bold text-white">{torch ? "Flash Nyala" : "Flash"}</Text></View>
              </Pressable>
              <Pressable
                onPress={scanFromGallery}
                disabled={galleryBusy}
                className={"flex-1 items-center rounded-2xl border border-[#B9C99A]/50 bg-[#3E5219] px-4 py-3.5 " + (galleryBusy ? "opacity-60" : "")}
              >
                <View className="flex-row items-center gap-2">
                  {galleryBusy ? <ActivityIndicator color="#FFFFFF" /> : <AppIcon name="photo_camera" size={20} color="#FFFFFF" />}
                  <Text className="text-xs font-bold text-white">{galleryBusy ? "Memindai…" : "Dari Album"}</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

export function AttendanceSuccessScreen() {
  const router = useRouter();
  return (
    <Screen>
      <View className="items-center pt-3">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-[#F2F5E8]"><Text className="text-5xl text-[#3E5219]">✓</Text></View>
        <Text className="mt-5 text-2xl font-black text-gray-950">Absensi Berhasil!</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-gray-500">Kehadiran Anda sudah tercatat pada sesi Pelatihan Keberlanjutan Q3.</Text>
      </View>
      <GlassCard>
        <Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Kode Absensi</Text>
        <View className="mt-2 flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-4"><Text className="font-black tracking-[2px] text-gray-900">ABS-7K4P9X</Text><Text className="text-[#3E5219]">⧉</Text></View>
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
        <View className="items-center"><Image source={logo} resizeMode="contain" className="h-12 w-12 rounded-2xl" /><Text className="mt-2 text-lg font-black text-[#3E5219]">AyoHadir!</Text><Text className="mt-1 text-xs text-gray-500">Bukti Absensi Digital</Text></View>
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
  const [query, setQuery] = useState("");
  const rows = [
    ["Meeting Ruang Utama","15 Agustus 2024 · 08:02","Hadir","ABS-7K4P9X"],
    ["Pelatihan Keselamatan Kerja","14 Agustus 2024 · 09:16","Terlambat","ABS-5P8X2M"],
    ["Briefing Proyek Alpha","12 Agustus 2024 · 08:00","Hadir","ABS-2K3L8Q"]
  ];

  const normalizedQuery = query.trim().toLowerCase();
  const filteredRows = rows.filter((row) => {
    if (!normalizedQuery) return true;
    return row.join(" ").toLowerCase().includes(normalizedQuery);
  });

  return (
    <Screen bottomNav="history">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[28px] font-black text-gray-950">Riwayat Absensi</Text>
          <Text className="mt-1 text-sm leading-5 text-gray-500">Cari catatan absensi atau sesi yang pernah Anda ikuti.</Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-full bg-[#E4F1D2]">
          <AppIcon name="history" size={21} color="#3E5219" />
        </View>
      </View>

      <Segmented items={["Absensi Saya","Sesi Saya"]} value={mode} onChange={setMode} />

      <View className="flex-row items-center rounded-2xl border border-[#C5C8B8] bg-white px-4" style={{ minHeight: 54 }}>
        <AppIcon name="history" size={22} color="#75796B" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          className="ml-3 flex-1 py-3.5 text-base text-gray-900"
          placeholder="Cari riwayat atau kode absensi…"
          placeholderTextColor="#8A8D82"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery("")} className="h-8 w-8 items-center justify-center rounded-full bg-[#F4F3F1]">
            <AppIcon name="close" size={17} color="#75796B" />
          </Pressable>
        ) : null}
      </View>

      {mode === "Absensi Saya" ? (
        filteredRows.length ? (
          filteredRows.map((r) => (
            <GlassCard key={r[3]} className="p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-base font-black text-gray-900">{r[0]}</Text>
                  <Text className="mt-1 text-xs text-gray-500">{r[1]}</Text>
                </View>
                <Badge tone={r[2] === "Hadir" ? "green" : "yellow"}>{r[2]}</Badge>
              </View>
              <View className="mt-4 flex-row items-center justify-between border-t border-gray-100 pt-3">
                <Text className="text-[11px] font-semibold tracking-[1px] text-gray-400">{r[3]}</Text>
                <TextButton>Detail</TextButton>
              </View>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="items-center py-10">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F4F3F1]">
              <AppIcon name="history" size={24} color="#75796B" />
            </View>
            <Text className="mt-3 text-base font-black text-gray-900">Tidak ada hasil</Text>
            <Text className="mt-1 text-center text-sm text-gray-500">Coba kata kunci atau kode absensi yang lain.</Text>
          </GlassCard>
        )
      ) : (
        <GlassCard>
          <Badge>Sesi Saya</Badge>
          <Text className="mt-3 text-base font-black text-gray-900">Sesi QR Buatan Saya</Text>
          <Text className="mt-2 text-sm leading-5 text-gray-500">Pelatihan Keberlanjutan Q3 · 42/50 peserta</Text>
          <PrimaryButton className="mt-4" onPress={() => {}}>
            <ButtonText>Lihat detail sesi</ButtonText>
          </PrimaryButton>
        </GlassCard>
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
      <View className="items-center pt-5"><View className="h-20 w-20 items-center justify-center rounded-full bg-[#F2F5E8]"><Text className="text-4xl text-[#3E5219]">✓</Text></View><Text className="mt-5 text-2xl font-black text-gray-950">Pengajuan Terkirim</Text><Text className="mt-2 text-center text-sm leading-5 text-gray-500">Permintaan pembatalan sudah dikirim kepada pembuat QR.</Text></View>
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
      <View className="flex-row items-center justify-between"><View><Text className="text-[28px] font-black text-gray-950">Notifikasi</Text><Text className="mt-1 text-sm text-gray-500">Pembaruan absensi dan QR Anda.</Text></View><Pressable onPress={() => setAllRead(true)}><Text className="text-xs font-bold text-[#3E5219]">Tandai semua dibaca</Text></Pressable></View>
      {items.map((i) => <Pressable key={i[0]} onPress={() => i[0] === "Absensi berhasil" && router.push("/screens/attendance-proof")} className={"rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm " + (allRead ? "opacity-70" : "")}><View className="flex-row"><View className={"h-10 w-10 items-center justify-center rounded-full " + (i[3] === "green" ? "bg-[#F2F5E8]" : i[3] === "yellow" ? "bg-amber-50" : "bg-gray-100")}><Text className="font-black text-gray-700">{i[4]}</Text></View><View className="ml-3 flex-1"><View className="flex-row items-start justify-between"><Text className="flex-1 text-sm font-black text-gray-900">{i[0]}</Text><Text className="ml-3 text-[10px] text-gray-400">{i[2]}</Text></View><Text className="mt-1 text-xs leading-5 text-gray-500">{i[1]}</Text></View></View></Pressable>)}
    </Screen>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const name = profile?.display_name || "Pengguna";
  const verified = Boolean(user?.email_confirmed_at);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const goSettings = (section: string) =>
    router.push(("/screens/settings/" + section) as any);

  return (
    <>
      <Screen bottomNav="profile">
        <View className="flex-row items-end justify-between">
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-[2px] text-[#3E5219]">Akun Saya</Text>
            <Text className="mt-1 text-[30px] font-black text-gray-950">Profil</Text>
          </View>
          <Pressable onPress={() => router.push("/screens/profile-settings")} className="h-11 w-11 items-center justify-center rounded-full border border-[#C5C8B8] bg-white">
            <AppIcon name="settings" size={21} color="#3E5219" />
          </Pressable>
        </View>

        <GlassCard className="items-center rounded-[24px] border-[#C5C8B8] bg-[#F4F3F1] p-6">
          <AvatarView uri={profile?.avatar_url} name={name} size={112} />
          <Text className="mt-4 text-xl font-black text-gray-950">{name}</Text>
          <Text className="mt-1 text-sm text-gray-500">{user?.email || "Belum ada email"}</Text>
          <View className="mt-3 items-center">
            <Badge tone={verified ? "green" : "yellow"}>{verified ? "✓ Email Terverifikasi" : "Email Belum Terverifikasi"}</Badge>
          </View>
        </GlassCard>

        <GlassCard className="overflow-hidden rounded-[22px] p-2">
          <RowButton icon="person" title="Edit Profile" subtitle="Ubah nama dan foto profil" onPress={() => router.push("/screens/profile-settings")} />
          <RowButton icon="devices" title="Perangkat" subtitle="Lihat perangkat dan sesi aplikasi" onPress={() => goSettings("devices")} />
          <RowButton icon="logout" title="Keluar" subtitle="Keluar dari akun pada perangkat ini" onPress={() => setLogoutVisible(true)} trailing="›" />
        </GlassCard>
      </Screen>

      <LogoutConfirmModal visible={logoutVisible} onClose={() => setLogoutVisible(false)} />
    </>
  );
}

function AvatarView({ uri, name, size }: { uri: string | null | undefined; name: string; size: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || "A";

  return (
    <View
      style={{ width: size, height: size }}
      className="overflow-hidden rounded-full border-4 border-white bg-[#F2F5E8] shadow-sm"
    >
      {uri ? (
        <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
      ) : (
        <View className="h-full w-full items-center justify-center">
          <Text className="text-4xl font-black text-[#3E5219]">{initial}</Text>
        </View>
      )}
    </View>
  );
}

function LogoutConfirmModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const confirmLogout = async () => {
    onClose();
    await supabase.auth.signOut();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-end bg-black/40 px-5 pb-7">
        <View className="w-full rounded-[28px] bg-white p-6">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AppIcon name="logout" size={22} color="#DC2626" />
          </View>
          <Text className="mt-4 text-xl font-black text-gray-950">Keluar dari akun?</Text>
          <Text className="mt-2 text-sm leading-6 text-gray-500">
            Anda akan keluar dari sesi AyoHadir pada perangkat ini.
          </Text>

          <View className="mt-5 flex-row gap-3">
            <SecondaryButton className="flex-1" onPress={onClose}>
              <Text className="text-sm font-bold text-gray-800">Batal</Text>
            </SecondaryButton>
            <DangerButton onPress={confirmLogout}>
              <Text className="text-sm font-bold text-red-700">Keluar</Text>
            </DangerButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function ProfileSettingsScreen() {
  const router = useRouter();
  const { profile, user, updateDisplayName, updateAvatarUrl } = useAuth();
  const [name, setName] = useState(profile?.display_name || "Pengguna");
  const [avatar, setAvatar] = useState<string | null>(profile?.avatar_url ?? null);
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const goSettings = (section: string) =>
    router.push(("/screens/settings/" + section) as any);

  const pickAvatar = async () => {
    if (avatarBusy || !user) return;

    setNotice(null);
    setAvatarBusy(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const buffer = await response.arrayBuffer();
      const extension = asset.mimeType?.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
      const path = user.id + "/avatar-" + Date.now() + "." + extension;

      const { error: uploadError } = await supabase.storage.from("profile-avatars").upload(path, buffer, {
        contentType: asset.mimeType || "image/jpeg",
        cacheControl: "3600",
        upsert: false
      });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("profile-avatars").getPublicUrl(path);
      await updateAvatarUrl(data.publicUrl);
      setAvatar(data.publicUrl);
      setNotice("Foto profil berhasil diperbarui.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Foto profil gagal disimpan.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const saveProfile = async () => {
    if (saving || avatarBusy) return;

    setNotice(null);
    setSaving(true);

    try {
      await updateDisplayName(name);
      setNotice("Perubahan profil berhasil disimpan.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Profil tidak dapat disimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <BackHeader title="Edit Profile" />

      <GlassCard className="items-center rounded-[24px] border-[#C5C8B8] bg-[#F4F3F1] p-6">
        <Pressable onPress={pickAvatar} disabled={avatarBusy} className="relative">
          <AvatarView uri={avatar} name={name} size={112} />
          <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#3E5219]">
            {avatarBusy ? <ActivityIndicator color="#FFFFFF" size="small" /> : <AppIcon name="photo_camera" size={17} color="#FFFFFF" />}
          </View>
        </Pressable>

        <Text className="mt-4 text-xl font-black text-gray-950">{name || "Pengguna"}</Text>
        <Text className="mt-1 text-sm text-gray-500">{user?.email || "Belum ada email"}</Text>
        <View className="mt-3 w-full items-center">
          <Badge>{Boolean(user?.email_confirmed_at) ? "Terverifikasi" : "Belum Terverifikasi"}</Badge>
        </View>
        <Text className="mt-3 text-center text-xs leading-5 text-gray-400">Ketuk foto untuk memilih foto profil baru.</Text>
      </GlassCard>

      <GlassCard className="rounded-[22px]">
        <Text className="text-base font-black text-gray-950">Data Profil</Text>
        <Text className="mt-3 text-xs font-semibold text-gray-500">Nama tampilan</Text>
        <TextInput
          value={name}
          onChangeText={(value) => { setNotice(null); setName(value); }}
          className="mt-2 rounded-2xl border border-[#C5C8B8] bg-[#FAF9F6] px-4 py-3.5 text-base text-gray-900"
          placeholder="Masukkan nama"
          placeholderTextColor="#8A8D82"
          autoCapitalize="words"
          returnKeyType="done"
        />

        {notice ? (
          <View className="mt-3 rounded-2xl border border-[#DDE8C9] bg-[#F2F5E8] px-4 py-3">
            <Text className="text-xs font-semibold leading-5 text-[#3E5219]">{notice}</Text>
          </View>
        ) : null}

        <PrimaryButton className="mt-3" disabled={saving || avatarBusy} onPress={saveProfile}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <ButtonText>Simpan Perubahan</ButtonText>}
        </PrimaryButton>
      </GlassCard>

      <GlassCard className="overflow-hidden rounded-[22px] p-2">
        <Text className="px-1 pt-2 text-xs font-bold uppercase tracking-[2px] text-gray-500">Pengaturan Kehadiran</Text>
        <RowButton icon="⌖" title="Pengaturan Lokasi" subtitle="Preferensi GPS dan validasi lokasi" onPress={() => goSettings("location")} trailing="›" />
        <RowButton icon="☼" title="Preferensi Aplikasi" subtitle="Notifikasi, tampilan, dan pengalaman" onPress={() => goSettings("preferences")} trailing="›" />
        <RowButton icon="🔒" title="Ubah Password" subtitle="Perbarui password akun Anda" onPress={() => router.push("/update-password")} trailing="›" />
      </GlassCard>

      <GlassCard className="overflow-hidden rounded-[22px] p-2">
        <Text className="px-1 pt-2 text-xs font-bold uppercase tracking-[2px] text-gray-500">Dukungan & Legal</Text>
        <RowButton icon="?" title="Pusat Bantuan" onPress={() => goSettings("help")} trailing="›" />
        <RowButton icon="i" title="Kebijakan Privasi" onPress={() => goSettings("privacy")} trailing="›" />
        <RowButton icon="§" title="Syarat & Ketentuan" onPress={() => goSettings("terms")} trailing="›" />
      </GlassCard>
    </Screen>
  );
}

export function PermissionsAccessScreen() {
  const router = useRouter();
  return (
    <Screen scroll={false} contentClassName="justify-center px-6">
      <GlassCard className="w-full max-w-md self-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#F2F5E8]"><Text className="text-3xl text-[#3E5219]">✓</Text></View>
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
        <View className="items-center"><View className="h-16 w-16 items-center justify-center rounded-full bg-[#F2F5E8]"><Text className="text-3xl text-[#3E5219]">◉</Text></View><Text className="mt-4 text-center text-2xl font-black text-gray-950">Stay Updated</Text><Text className="mt-2 text-center text-sm leading-5 text-gray-500">Aktifkan notifikasi untuk menerima pembaruan penting.</Text></View>
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
      <GlassCard><Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Offline Queue</Text><Text className="mt-2 text-3xl font-black text-[#3E5219]">3</Text><Text className="mt-1 text-sm text-gray-500">data menunggu sinkronisasi</Text><ProgressBar value={72} /></GlassCard>
      <OfflineBanner text="Sinkronisasi tertunda tidak mengubah waktu scan asli. Data akan divalidasi server saat koneksi tersedia." />
      <Segmented items={["Semua","Tertunda","Selesai"]} value={filter} onChange={setFilter} />
      {rows.filter((r) => filter === "Semua" || (filter === "Selesai" ? r[3] === "green" : r[3] === "yellow")).map((r) => <GlassCard key={r[0]} className="p-4"><View className="flex-row items-start justify-between"><View className="flex-1"><Text className="text-sm font-black text-gray-900">{r[0]}</Text><Text className="mt-1 text-xs text-gray-500">{r[1]}</Text></View><Badge tone={r[3] === "green" ? "green" : "yellow"}>{r[2]}</Badge></View></GlassCard>)}
      <PrimaryButton><ButtonText>↻ Sinkronkan Sekarang</ButtonText></PrimaryButton>
    </Screen>
  );
}
