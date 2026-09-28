
import { useEffect, useState } from "react";
import { ActivityIndicator, AppState, Image, Linking, Modal, PanResponder, Pressable, ScrollView, Switch, Text, TextInput, View, type DimensionValue } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export function ExpiredQrScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string | string[] }>();
  const name = Array.isArray(params.name) ? params.name[0] : params.name;

  return (
    <Screen bottomNav="history">
      <BackHeader title="Detail Sesi" />
      <View className="items-center pt-3">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <Text className="text-3xl text-gray-500">×</Text>
        </View>
        <Text className="mt-5 text-2xl font-black text-gray-950">QR Kedaluwarsa</Text>
        <Badge tone="gray">Kedaluwarsa</Badge>
      </View>
      <GlassCard>
        <Text className="text-base font-black text-gray-900">{name || "Sesi QR"}</Text>
        <Text className="mt-1 text-sm text-gray-500">Sesi sudah berakhir.</Text>
        <Text className="mt-4 text-sm leading-6 text-gray-600">
          Sesi tidak dapat digunakan untuk absensi lagi. Riwayat absensi tetap tersimpan sebagai arsip.
        </Text>
        <View className="mt-4 items-center"><QrVisual size={190} label="ARSIP" /></View>
      </GlassCard>
      <PrimaryButton onPress={() => router.push("/history")}><ButtonText>Lihat Riwayat</ButtonText></PrimaryButton>
    </Screen>
  );
}

export function CancellationSubmittedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ attendance_id?: string | string[] }>();
  const attendanceId = Array.isArray(params.attendance_id) ? params.attendance_id[0] : params.attendance_id;

  return (
    <Screen>
      <View className="items-center pt-5">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-[#F2F5E8]"><Text className="text-4xl text-[#3E5219]">✓</Text></View>
        <Text className="mt-5 text-2xl font-black text-gray-950">Pengajuan Terkirim</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-gray-500">Permintaan pembatalan sudah dikirim kepada pembuat QR.</Text>
      </View>
      <GlassCard>
        <Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Detail Pengajuan</Text>
        {attendanceId ? <Text className="mt-3 text-sm font-black text-gray-900">Attendance {attendanceId}</Text> : null}
        <Badge tone="yellow">Menunggu keputusan</Badge>
        <Text className="mt-3 text-xs leading-5 text-gray-500">Alasan tersimpan dan catatan absensi asli tidak dihapus.</Text>
      </GlassCard>
      <PrimaryButton onPress={() => router.push("/history")}><ButtonText>Kembali ke Riwayat</ButtonText></PrimaryButton>
    </Screen>
  );
}

export function CancellationApprovedScreen() {
  const router = useRouter();
  return (
    <Screen bottomNav="notifications">
      <BackHeader title="Status Pembatalan" />
      <GlassCard>
        <Badge>Disetujui</Badge>
        <Text className="mt-3 text-2xl font-black text-gray-950">Pengajuan pembatalan disetujui</Text>
        <Text className="mt-2 text-sm leading-5 text-gray-500">Status absensi telah diperbarui tanpa menghapus rekam audit.</Text>
      </GlassCard>
      <PrimaryButton onPress={() => router.push("/history")}><ButtonText>Kembali ke Riwayat</ButtonText></PrimaryButton>
    </Screen>
  );
}

export function CancellationRejectedScreen() {
  const router = useRouter();
  return (
    <Screen bottomNav="notifications">
      <BackHeader title="Status Pembatalan" />
      <GlassCard>
        <Badge tone="red">Ditolak</Badge>
        <Text className="mt-3 text-2xl font-black text-gray-950">Pengajuan pembatalan ditolak</Text>
        <Text className="mt-2 text-sm leading-5 text-gray-500">Catatan absensi tetap tersimpan dengan jejak keputusan.</Text>
      </GlassCard>
      <SecondaryButton onPress={() => router.push("/history")}><Text className="text-sm font-bold text-gray-800">Kembali ke Riwayat</Text></SecondaryButton>
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

