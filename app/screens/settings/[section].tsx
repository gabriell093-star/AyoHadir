import { useState } from "react";
import { Linking, Platform, Switch, Text, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams } from "expo-router";

import { AppIcon, BackHeader, Badge, ButtonText, GlassCard, PrimaryButton, Screen, SecondaryButton } from "@/components/ui";
import { supabase } from "@/lib/supabase";

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <View>
      <Text className="text-xs font-black uppercase tracking-[2px] text-[#3E5219]">{eyebrow}</Text>
      <Text className="mt-1 text-[28px] font-black text-gray-950">{title}</Text>
      <Text className="mt-2 text-sm leading-5 text-gray-500">{subtitle}</Text>
    </View>
  );
}

export default function SettingsSectionScreen() {
  const { section: rawSection } = useLocalSearchParams<{ section?: string | string[] }>();
  const section = first(rawSection);

  if (section === "devices") return <DevicesSettings />;
  if (section === "location") return <LocationSettings />;
  if (section === "preferences") return <PreferenceSettings />;
  if (section === "help") return <HelpSettings />;
  if (section === "privacy") return <PrivacySettings />;
  if (section === "terms") return <TermsSettings />;

  return (
    <Screen>
      <BackHeader title="Pengaturan" />
      <GlassCard className="items-center py-10">
        <AppIcon name="error" size={34} color="#3E5219" />
        <Text className="mt-4 text-lg font-black text-gray-950">Menu tidak ditemukan</Text>
        <Text className="mt-1 text-center text-sm text-gray-500">Kembali ke Edit Profile untuk memilih menu yang tersedia.</Text>
      </GlassCard>
    </Screen>
  );
}

function DevicesSettings() {
  const [busy, setBusy] = useState(false);

  const signOutHere = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
  };

  return (
    <Screen>
      <BackHeader title="Perangkat" />
      <SectionTitle eyebrow="Akun & Keamanan" title="Perangkat" subtitle="Periksa sesi aplikasi yang sedang aktif di perangkat ini." />

      <GlassCard className="mt-1">
        <View className="flex-row items-center">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#E4F1D2]">
            <AppIcon name="devices" size={24} color="#3E5219" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-black text-gray-950">Perangkat ini</Text>
            <Text className="mt-1 text-xs text-gray-500">{Platform.OS === "android" ? "Android" : Platform.OS}</Text>
          </View>
          <Badge>Aktif</Badge>
        </View>
        <View className="mt-5 border-t border-gray-100 pt-4">
          <Text className="text-xs font-semibold text-gray-500">Sesi aplikasi</Text>
          <Text className="mt-1 text-sm font-bold text-gray-900">Sesi akun tersimpan di perangkat ini untuk menjaga Anda tetap masuk.</Text>
        </View>
      </GlassCard>

      <GlassCard>
        <Text className="text-base font-black text-gray-950">Keamanan</Text>
        <Text className="mt-2 text-sm leading-5 text-gray-500">Gunakan keluar dari perangkat ini bila Anda selesai memakai akun pada ponsel bersama.</Text>
        <PrimaryButton className="mt-4" disabled={busy} onPress={signOutHere}>
          <ButtonText>{busy ? "Memproses…" : "Keluar dari perangkat ini"}</ButtonText>
        </PrimaryButton>
      </GlassCard>
    </Screen>
  );
}

function LocationSettings() {
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [precise, setPrecise] = useState(true);

  return (
    <Screen>
      <BackHeader title="Pengaturan Lokasi" />
      <SectionTitle eyebrow="Kehadiran" title="Lokasi" subtitle="Atur bagaimana GPS digunakan saat membuat dan memvalidasi absensi." />

      <GlassCard className="mt-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base font-black text-gray-950">Izinkan lokasi</Text>
            <Text className="mt-1 text-xs leading-5 text-gray-500">Gunakan lokasi perangkat saat sesi mengaktifkan geofencing.</Text>
          </View>
          <Switch value={locationEnabled} onValueChange={setLocationEnabled} trackColor={{ false: "#D9DCD1", true: "#879B5A" }} thumbColor="#FFFFFF" />
        </View>

        <View className="mt-5 border-t border-gray-100 pt-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-base font-black text-gray-950">Lokasi presisi</Text>
              <Text className="mt-1 text-xs leading-5 text-gray-500">Gunakan data lokasi yang lebih presisi saat validasi radius.</Text>
            </View>
            <Switch value={precise} onValueChange={setPrecise} disabled={!locationEnabled} trackColor={{ false: "#D9DCD1", true: "#879B5A" }} thumbColor="#FFFFFF" />
          </View>
        </View>
      </GlassCard>

      <GlassCard className="border-[#DDE8C9] bg-[#F2F5E8]">
        <View className="flex-row items-start gap-3">
          <AppIcon name="info" size={20} color="#3E5219" />
          <Text className="flex-1 text-xs leading-5 text-[#2F4014]">
            GPS tetap mengikuti pengaturan setiap sesi. Mematikan lokasi di sini tidak mengubah QR yang sudah dibuat.
          </Text>
        </View>
      </GlassCard>
    </Screen>
  );
}

function PreferenceSettings() {
  const [autoSync, setAutoSync] = useState(true);

  useEffect(() => {
    void SecureStore.getItemAsync("ayohadir_auto_sync_enabled_v1").then(value => {
      if (value === "false") setAutoSync(false);
    });
  }, []);

  const toggleAutoSync = async (value: boolean) => {
    setAutoSync(value);
    await SecureStore.setItemAsync("ayohadir_auto_sync_enabled_v1", String(value));
  };

  return (
    <Screen>
      <BackHeader title="Preferensi Aplikasi" />
      <SectionTitle eyebrow="Pengalaman" title="Preferensi" subtitle="Atur perilaku dasar AyoHadir di perangkat ini." />

      <GlassCard className="mt-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base font-black text-gray-950">Notifikasi in-app</Text>
            <Text className="mt-1 text-xs leading-5 text-gray-500">
              Pembaruan absensi, QR, dan sinkronisasi tersedia di pusat notifikasi.
            </Text>
          </View>
          <Badge>Aktif</Badge>
        </View>

        <View className="mt-5 border-t border-gray-100 pt-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-base font-black text-gray-950">Sinkronisasi otomatis</Text>
              <Text className="mt-1 text-xs leading-5 text-gray-500">
                Kirim data offline saat koneksi tersedia dan aplikasi aktif.
              </Text>
            </View>
            <Switch
              value={autoSync}
              onValueChange={toggleAutoSync}
              trackColor={{ false: "#D9DCD1", true: "#879B5A" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </GlassCard>
    </Screen>
  );
}


function HelpSettings() {
  const faqs = [
    ["Bagaimana cara membuat QR?", "Buka tombol QR di navigasi bawah, pilih Buat QR, atur sesi, lalu tinjau sebelum membuat QR."],
    ["Apakah scan bisa offline?", "Ya. Data scan dapat ditahan sementara dan diberi status Sinkronisasi tertunda sampai koneksi tersedia."],
    ["Bagaimana bila QR tidak terbaca?", "Pastikan pencahayaan cukup, tampilkan QR utuh di dalam bingkai, atau gunakan opsi Dari Album."]
  ];

  return (
    <Screen>
      <BackHeader title="Pusat Bantuan" />
      <SectionTitle eyebrow="Bantuan" title="Pusat Bantuan" subtitle="Jawaban singkat untuk alur utama AyoHadir." />
      {faqs.map(([question, answer]) => (
        <GlassCard key={question}>
          <View className="flex-row items-start gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-[#E4F1D2]">
              <AppIcon name="help" size={19} color="#3E5219" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-black text-gray-950">{question}</Text>
              <Text className="mt-2 text-xs leading-5 text-gray-500">{answer}</Text>
            </View>
          </View>
        </GlassCard>
      ))}
    </Screen>
  );
}

function PrivacySettings() {
  return (
    <Screen>
      <BackHeader title="Kebijakan Privasi" />
      <SectionTitle eyebrow="Legal" title="Kebijakan Privasi" subtitle="Ringkasan penggunaan data pada AyoHadir." />
      <GlassCard className="mt-1 gap-4">
        <Text className="text-sm leading-6 text-gray-700">AyoHadir menggunakan data akun untuk autentikasi dan menampilkan profil. Data absensi dapat mencakup waktu scan, kode absensi, perangkat, dan lokasi ketika GPS diaktifkan pada sesi.</Text>
        <Text className="text-sm leading-6 text-gray-700">Data lokal untuk antrean offline dipakai agar waktu scan asli tetap terjaga sampai proses sinkronisasi selesai.</Text>
        <Text className="text-sm leading-6 text-gray-700">Jangan masukkan informasi sensitif yang tidak diperlukan ke dalam judul sesi atau alasan pembatalan.</Text>
      </GlassCard>
    </Screen>
  );
}

function TermsSettings() {
  return (
    <Screen>
      <BackHeader title="Syarat & Ketentuan" />
      <SectionTitle eyebrow="Legal" title="Syarat & Ketentuan" subtitle="Aturan penggunaan dasar AyoHadir." />
      <GlassCard className="mt-1 gap-4">
        <Text className="text-sm leading-6 text-gray-700">Gunakan AyoHadir hanya untuk absensi yang sah dan sesuai izin pemilik sesi.</Text>
        <Text className="text-sm leading-6 text-gray-700">Pengguna bertanggung jawab atas akun, password, serta perangkat yang digunakan untuk mengakses aplikasi.</Text>
        <Text className="text-sm leading-6 text-gray-700">Penggunaan QR, lokasi, dan fitur offline harus mengikuti pengaturan sesi serta aturan organisasi yang berlaku.</Text>
      </GlassCard>
      <SecondaryButton onPress={() => Linking.openSettings()}>
        <Text className="text-sm font-bold text-[#45483C]">Pengaturan Aplikasi</Text>
      </SecondaryButton>
    </Screen>
  );
}
