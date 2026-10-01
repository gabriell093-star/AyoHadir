import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState, Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/auth/auth-context";
import {
  AppIcon,
  Badge,
  GlassCard,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SoftCard,
  StatCard,
  UI
} from "@/components/ui";
import { supabase } from "@/lib/supabase";

function Avatar({ uri, name }: { uri?: string | null; name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "A";
  return (
    <View className="h-11 w-11 overflow-hidden rounded-full border border-[#C5C8B8]/40 bg-[#F2F5E8]">
      {uri ? (
        <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
      ) : (
        <View className="h-full w-full items-center justify-center">
          <Text className="text-sm font-black text-[#3E5219]">{initial}</Text>
        </View>
      )}
    </View>
  );
}

function formatTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function statusLabel(status?: string | null) {
  if (status === "late") return "Terlambat";
  if (status === "cancelled") return "Dibatalkan";
  return "Hadir";
}

export function DashboardWiredScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [online, setOnline] = useState<boolean | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const onlineResult = await fetch(
        "https://sqrvntrxoytjnbgticpd.supabase.co/auth/v1/health"
      )
        .then((response) => response.status < 500)
        .catch(() => false);
      setOnline(Boolean(onlineResult));

      const [attendanceResult, sessionResult] = await Promise.all([
        supabase
          .from("attendance")
          .select(
            "id,qr_id,status,unique_code,server_recorded_at,scanned_at,sync_status,location_verified,device_name,qr_sessions(name)"
          )
          .eq("user_id", user.id)
          .order("server_recorded_at", { ascending: false })
          .limit(6),
        supabase
          .from("qr_sessions")
          .select("id,name,starts_at,ends_at,status,gps_enabled")
          .eq("owner_id", user.id)
          .order("starts_at", { ascending: false })
          .limit(6)
      ]);

      setAttendance(attendanceResult.data ?? []);
      setSessions(sessionResult.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void load();
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [load]);

  const todayCount = useMemo(() => {
    const today = new Date();
    return attendance.filter((item) => {
      const stamp = item.server_recorded_at || item.scanned_at;
      if (!stamp) return false;
      const date = new Date(stamp);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }).length;
  }, [attendance]);

  const activeSessions = sessions.filter((session) => session.status === "active").slice(0, 3);
  const recentAttendance = attendance.slice(0, 3);

  return (
    <Screen bottomNav="home" contentClassName="gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center pr-3">
          <Avatar uri={profile?.avatar_url} name={profile?.display_name ?? "Pengguna"} />
          <View className="ml-3 flex-1">
            <Text className="text-xs font-semibold text-gray-500">AyoHadir!</Text>
            <Text className="mt-0.5 text-[18px] font-black text-gray-950">
              Halo, {profile?.display_name || "Pengguna"} 👋
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push("/screens/profile-settings")}
          className="h-11 w-11 items-center justify-center rounded-full border border-[#C5C8B8]/40 bg-white"
        >
          <AppIcon name="settings" size={21} color={UI.greenDark} />
        </Pressable>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <Badge tone={user?.email_confirmed_at ? "green" : "yellow"}>
          {user?.email_confirmed_at ? "✓ Email terverifikasi" : "Email belum terverifikasi"}
        </Badge>
        <Badge tone={online === null ? "yellow" : online ? "green" : "gray"}>
          {online === null ? "Memeriksa koneksi…" : online ? "Online" : "Offline"}
        </Badge>
      </View>

      <SoftCard className="overflow-hidden">
        <View className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-[#3E5219]/5" />
        <Text className="text-xs font-black uppercase tracking-[2px] text-[#3E5219]">
          Siap absen?
        </Text>
        <Text className="mt-2 text-[24px] font-black leading-7 text-gray-950">
          Pindai QR dan konfirmasi kehadiran.
        </Text>
        <Text className="mt-2 max-w-[92%] text-sm leading-5 text-gray-600">
          Validasi akun, sesi, token QR, waktu, target peserta, dan GPS dilakukan di server.
        </Text>
        <PrimaryButton className="mt-5" onPress={() => router.push("/screens/scan-qr")}>
          <View className="flex-row items-center gap-2">
            <AppIcon name="qr_code_scanner" size={20} color="#FFFFFF" />
            <Text className="font-bold text-white">Scan QR</Text>
          </View>
        </PrimaryButton>
      </SoftCard>

      <View className="flex-row gap-3">
        <StatCard label="Absensi hari ini" value={String(todayCount)} />
        <StatCard label="Sesi aktif" value={String(activeSessions.length)} />
      </View>

      <View className="flex-row gap-3">
        <SecondaryButton className="flex-1" onPress={() => router.push("/screens/scan-qr")}>
          <View className="flex-row items-center gap-2">
            <AppIcon name="qr_code_scanner" size={19} color={UI.greenDark} />
            <Text className="text-sm font-bold text-gray-800">Pindai</Text>
          </View>
        </SecondaryButton>
        <SecondaryButton className="flex-1" onPress={() => router.push("/screens/create-session")}>
          <View className="flex-row items-center gap-2">
            <AppIcon name="qr_code_2" size={19} color={UI.greenDark} />
            <Text className="text-sm font-bold text-gray-800">Buat QR</Text>
          </View>
        </SecondaryButton>
      </View>

      <View className="flex-row items-center justify-between pt-1">
        <Text className="text-[20px] font-extrabold text-gray-950">Sesi aktif</Text>
        <Pressable onPress={() => router.push("/history")}>
          <Text className="text-sm font-bold text-[#3E5219]">Lihat semua</Text>
        </Pressable>
      </View>

      {activeSessions.length ? (
        activeSessions.map((session) => (
          <Pressable
            key={session.id}
            onPress={() =>
              router.push({
                pathname: "/screens/active-qr",
                params: {
                  qr_id: session.id,
                  title: session.name,
                  starts_at: session.starts_at,
                  ends_at: session.ends_at,
                  gps: String(Boolean(session.gps_enabled))
                }
              })
            }
          >
            <GlassCard className="p-4">
              <View className="flex-row items-start">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#E4F1D2]">
                  <AppIcon name="qr" size={22} color={UI.greenDark} />
                </View>
                <View className="ml-3 flex-1 pr-3">
                  <Text className="text-base font-black text-gray-950" numberOfLines={1}>
                    {session.name || "Sesi QR"}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-500">
                    {formatTime(session.starts_at)} – {formatTime(session.ends_at)}
                  </Text>
                </View>
                <Badge>Aktif</Badge>
              </View>
              <View className="mt-4 flex-row items-center justify-between border-t border-gray-100 pt-3">
                <Text className="text-xs font-semibold text-gray-500">
                  GPS {session.gps_enabled ? "aktif" : "nonaktif"}
                </Text>
                <Text className="text-xs font-bold text-[#3E5219]">Buka sesi ›</Text>
              </View>
            </GlassCard>
          </Pressable>
        ))
      ) : (
        <GlassCard className="items-center py-8">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#F2F5E8]">
            <AppIcon name="qr_code_2" size={24} color={UI.greenDark} />
          </View>
          <Text className="mt-3 text-base font-black text-gray-950">Belum ada sesi aktif</Text>
          <Text className="mt-1 text-center text-xs leading-5 text-gray-500">
            Buat sesi QR saat Anda perlu menerima kehadiran peserta.
          </Text>
        </GlassCard>
      )}

      <View className="flex-row items-center justify-between pt-1">
        <Text className="text-[20px] font-extrabold text-gray-950">Aktivitas terbaru</Text>
        <Pressable onPress={() => router.push("/history")}>
          <Text className="text-sm font-bold text-[#3E5219]">Riwayat</Text>
        </Pressable>
      </View>

      {loading && !attendance.length ? (
        <GlassCard>
          <Text className="text-sm text-gray-500">Memuat aktivitas…</Text>
        </GlassCard>
      ) : recentAttendance.length ? (
        <GlassCard className="overflow-hidden p-2">
          {recentAttendance.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() =>
                router.push({
                  pathname: "/screens/attendance-proof",
                  params: { attendance_id: item.id }
                })
              }
              className={[
                "flex-row items-center rounded-2xl px-3 py-3.5",
                index < recentAttendance.length - 1 ? "border-b border-gray-100" : ""
              ].join(" ")}
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F2F5E8]">
                <AppIcon
                  name={item.status === "late" ? "schedule" : "check_circle"}
                  size={19}
                  color={item.status === "late" ? UI.yellow : UI.greenDark}
                />
              </View>
              <View className="ml-3 flex-1 pr-3">
                <Text className="text-sm font-black text-gray-950" numberOfLines={1}>
                  {item.qr_sessions?.name || "Sesi QR"}
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  {formatTime(item.server_recorded_at || item.scanned_at)} · {item.unique_code || "-"}
                </Text>
              </View>
              <Badge tone={item.status === "late" ? "yellow" : item.status === "cancelled" ? "red" : "green"}>
                {statusLabel(item.status)}
              </Badge>
            </Pressable>
          ))}
        </GlassCard>
      ) : (
        <GlassCard className="py-7">
          <Text className="text-sm font-bold text-gray-900">Belum ada absensi.</Text>
          <Text className="mt-1 text-xs leading-5 text-gray-500">
            Riwayat absensi akan muncul di sini setelah Anda melakukan scan.
          </Text>
        </GlassCard>
      )}
    </Screen>
  );
}
