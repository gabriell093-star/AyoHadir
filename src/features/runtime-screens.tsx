import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, Modal, Pressable, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/auth/auth-context";
import { supabase } from "@/lib/supabase";
import { AyoHadirLogo, AppIcon, Badge, BackHeader, ButtonText, DangerButton, GlassCard, PrimaryButton, RowButton, Screen, SecondaryButton, UI } from "@/components/ui";

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

export function ProfileScreen(){
 const router=useRouter();
 const {profile,user}=useAuth();
 const name=profile?.display_name||"Pengguna";
 const verified=Boolean(user?.email_confirmed_at);
 const [logoutVisible,setLogoutVisible]=useState(false);

 const goSettings=(section:string)=>router.push(("/screens/settings/"+section) as any);

 return <>
  <Screen bottomNav="profile">
   <View className="pt-1">
    <Text className="text-xs font-black uppercase tracking-[2px] text-[#3E5219]">Akun Saya</Text>
    <View className="mt-1 flex-row items-center justify-between">
     <Text className="text-[28px] font-black text-gray-950">Profil</Text>
     <Pressable onPress={()=>router.push("/screens/profile-settings")} className="h-11 w-11 items-center justify-center rounded-full border border-[#C5C8B8]/40 bg-white">
      <AppIcon name="settings" size={21} color={UI.greenDark}/>
     </Pressable>
    </View>
   </View>

   <GlassCard className="items-center overflow-hidden rounded-[28px] bg-[#F4F3F1] p-6">
    <View className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#E4F1D2]"/>
    <View className="absolute -bottom-16 -left-12 h-36 w-36 rounded-full bg-[#F5F5DC]"/>
    <AvatarView uri={profile?.avatar_url} name={name} size={118}/>
    <Text className="mt-4 text-[22px] font-black text-gray-950">{name}</Text>
    <Text className="mt-1 max-w-full text-center text-sm text-gray-500">{user?.email||"Belum ada email"}</Text>
    <View className="mt-3">
     <Badge tone={verified?"green":"yellow"}>{verified?"✓ Email Terverifikasi":"Email Belum Terverifikasi"}</Badge>
    </View>
    <PrimaryButton className="mt-5 w-full" onPress={()=>router.push("/screens/profile-settings")}>
     <View className="flex-row items-center gap-2"><AppIcon name="edit" size={18} color="#FFFFFF"/><Text className="font-bold text-white">Edit Profil</Text></View>
    </PrimaryButton>
   </GlassCard>

   <View className="pt-1">
    <Text className="mb-2 px-1 text-xs font-black uppercase tracking-[2px] text-gray-500">Pengaturan</Text>
    <GlassCard className="overflow-hidden p-2">
     <RowButton icon="location_on" title="Pengaturan Lokasi" subtitle="Preferensi GPS dan validasi lokasi" onPress={()=>goSettings("location")} trailing="›"/>
     <RowButton icon="tune" title="Preferensi Aplikasi" subtitle="Sinkronisasi dan pengalaman penggunaan" onPress={()=>goSettings("preferences")} trailing="›"/>
     <RowButton icon="devices" title="Perangkat" subtitle="Periksa sesi aplikasi pada perangkat ini" onPress={()=>goSettings("devices")} trailing="›"/>
    </GlassCard>
   </View>

   <View className="pt-1">
    <Text className="mb-2 px-1 text-xs font-black uppercase tracking-[2px] text-gray-500">Bantuan & Legal</Text>
    <GlassCard className="overflow-hidden p-2">
     <RowButton icon="help" title="Pusat Bantuan" subtitle="Panduan membuat QR, scan, offline, dan pembatalan" onPress={()=>goSettings("help")} trailing="›"/>
     <RowButton icon="info" title="Kebijakan Privasi" onPress={()=>goSettings("privacy")} trailing="›"/>
     <RowButton icon="description" title="Syarat & Ketentuan" onPress={()=>goSettings("terms")} trailing="›"/>
    </GlassCard>
   </View>

   <SecondaryButton className="border-red-200 bg-red-50" onPress={()=>setLogoutVisible(true)}>
    <View className="flex-row items-center gap-2"><AppIcon name="logout" size={18} color="#BA1A1A"/><Text className="font-bold text-red-700">Keluar dari akun</Text></View>
   </SecondaryButton>
  </Screen>
  <LogoutConfirmModal visible={logoutVisible} onClose={()=>setLogoutVisible(false)}/>
 </>;
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
      const mimeType = (asset.mimeType || "").toLowerCase();
      const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

      const response = await fetch(asset.uri);
      const buffer = await response.arrayBuffer();

      if (!allowedTypes.has(mimeType)) {
        throw new Error("Format foto tidak didukung.");
      }
      if (buffer.byteLength > 2 * 1024 * 1024) {
        throw new Error("Ukuran foto maksimal 2 MB.");
      }
      if (
        !Number.isFinite(asset.width) ||
        !Number.isFinite(asset.height) ||
        asset.width <= 0 ||
        asset.height <= 0 ||
        asset.width > 4096 ||
        asset.height > 4096
      ) {
        throw new Error("Resolusi foto terlalu besar.");
      }

      const bytes = new Uint8Array(buffer);
      const validSignature =
        (mimeType === "image/jpeg" &&
          bytes.length >= 3 &&
          bytes[0] === 0xff &&
          bytes[1] === 0xd8 &&
          bytes[2] === 0xff) ||
        (mimeType === "image/png" &&
          bytes.length >= 8 &&
          bytes[0] === 0x89 &&
          bytes[1] === 0x50 &&
          bytes[2] === 0x4e &&
          bytes[3] === 0x47 &&
          bytes[4] === 0x0d &&
          bytes[5] === 0x0a &&
          bytes[6] === 0x1a &&
          bytes[7] === 0x0a) ||
        (mimeType === "image/webp" &&
          bytes.length >= 12 &&
          bytes[0] === 0x52 &&
          bytes[1] === 0x49 &&
          bytes[2] === 0x46 &&
          bytes[3] === 0x46 &&
          bytes[8] === 0x57 &&
          bytes[9] === 0x45 &&
          bytes[10] === 0x42 &&
          bytes[11] === 0x50);

      if (!validSignature) {
        throw new Error("Berkas foto tidak valid.");
      }

      const extension =
        mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
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
      setNotice("Foto profil gagal disimpan. Periksa ukuran/format file dan coba lagi.");
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
      setNotice("Profil tidak dapat disimpan. Periksa nama lalu coba lagi.");
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
        <View className="items-center">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#F2F5E8]">
            <Text className="text-3xl text-[#3E5219]">◉</Text>
          </View>
          <Text className="mt-4 text-center text-2xl font-black text-gray-950">Notifikasi AyoHadir</Text>
          <Text className="mt-2 text-center text-sm leading-5 text-gray-500">
            Notifikasi absensi, QR, dan sinkronisasi tersedia langsung di pusat notifikasi aplikasi.
          </Text>
        </View>
        <View className="mt-5">
          <RowButton icon="✓" title="Absensi" subtitle="Pembaruan saat absensi berhasil atau selesai disinkronkan." />
          <RowButton icon="↻" title="Sinkronisasi" subtitle="Pembaruan saat data offline berhasil atau tertunda." />
          <RowButton icon="◷" title="QR" subtitle="Peringatan QR yang hampir kedaluwarsa atau sudah berakhir." />
        </View>
        <PrimaryButton className="mt-4" onPress={() => router.push("/notifications")}>
          <ButtonText>Lihat Notifikasi</ButtonText>
        </PrimaryButton>
        <SecondaryButton className="mt-3" onPress={() => router.back()}>
          <Text className="text-sm font-bold text-gray-800">Nanti</Text>
        </SecondaryButton>
      </GlassCard>
    </Screen>
  );
}



export function CancellationSubmittedScreen() {
  const router = useRouter();
  const p = useLocalSearchParams<Record<string,string>>();
  const [item,setItem] = useState<any|null>(null);
  useEffect(() => { if(p.attendance_id) void supabase.from("cancellation_requests").select("id,attendance_id,reason,status,reviewer_reason,created_at,reviewed_at").eq("attendance_id",p.attendance_id).order("created_at",{ascending:false}).limit(1).maybeSingle().then(({data})=>setItem(data)); }, [p.attendance_id]);
  return (
    <Screen>
      <BackHeader title="Pengajuan Pembatalan" />
      <GlassCard>
        <Badge tone={item?.status==="approved"?"green":item?.status==="rejected"?"red":"yellow"}>{item?.status==="approved"?"Disetujui":item?.status==="rejected"?"Ditolak":"Menunggu keputusan"}</Badge>
        <Text className="mt-3 text-2xl font-black text-gray-950">{item?.status==="approved"?"Pembatalan disetujui":item?.status==="rejected"?"Pembatalan ditolak":"Pengajuan Terkirim"}</Text>
        <Text className="mt-2 text-sm leading-5 text-gray-500">{item?.reason || "Permintaan pembatalan sudah dikirim kepada pembuat QR."}</Text>
      </GlassCard>
      <GlassCard>
        <Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Detail</Text>
        <Text className="mt-3 text-sm font-black text-gray-900">Attendance {item?.attendance_id || p.attendance_id || "-"}</Text>
        <Text className="mt-1 text-xs text-gray-500">Status: {item?.status || "pending"}</Text>
        {item?.reviewer_reason ? <Text className="mt-3 text-sm leading-5 text-gray-600">Catatan peninjau: {item.reviewer_reason}</Text> : null}
      </GlassCard>
      <PrimaryButton onPress={() => router.push("/history")}><ButtonText>Kembali ke Riwayat</ButtonText></PrimaryButton>
    </Screen>
  );
}


