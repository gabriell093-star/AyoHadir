import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/auth/auth-context";
import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, user, updateDisplayName } = useAuth();
  const [draftName, setDraftName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const displayName = draftName ?? profile?.display_name ?? "";

  const saveProfile = async () => {
    setNotice(null);
    setBusy(true);

    try {
      await updateDisplayName(displayName);
      setDraftName(null);
      setNotice("Profil berhasil diperbarui.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Profil gagal diperbarui."
      );
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    setNotice(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setNotice(error.message);
    }

    setBusy(false);
  };

  const emailVerified = Boolean(user?.email_confirmed_at);

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-5 px-5 pb-8 pt-6"
    >
      <View className="gap-2">
        <Text className="text-[28px] font-bold text-gray-950">Profil</Text>
        <Text className="text-base text-gray-500">
          Kelola informasi dasar akun dan keamanan Anda.
        </Text>
      </View>

      <View className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
        <View className="items-center gap-3">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <Text className="text-3xl font-black text-emerald-600">
              {(displayName || user?.email || "A").charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-xl font-bold text-gray-950">
            {displayName || "Pengguna"}
          </Text>
          <Text className="text-sm text-gray-500">{user?.email ?? "-"}</Text>

          <View className="rounded-full bg-emerald-50 px-3 py-1.5">
            <Text className="text-sm font-semibold text-emerald-700">
              {emailVerified
                ? "Email Terverifikasi"
                : "Email Belum Terverifikasi"}
            </Text>
          </View>
        </View>
      </View>

      <View className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
        <Text className="text-base font-bold text-gray-950">
          Nama tampilan
        </Text>
        <TextInput
          className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-950"
          value={displayName}
          onChangeText={setDraftName}
          placeholder="Nama lengkap"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
          editable={!busy}
        />

        <Pressable
          className={[
            "mt-3 items-center rounded-2xl bg-emerald-500 px-4 py-4",
            busy ? "opacity-60" : ""
          ].join(" ")}
          onPress={saveProfile}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-bold text-white">Simpan perubahan</Text>
          )}
        </Pressable>

        {notice ? (
          <Text className="mt-3 text-center text-sm leading-5 text-gray-600">
            {notice}
          </Text>
        ) : null}
      </View>

      <View className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
        <Text className="text-base font-bold text-gray-950">Keamanan</Text>

        <Pressable
          className="mt-3 rounded-2xl border border-gray-200 px-4 py-4"
          onPress={() => router.push("/update-password")}
          disabled={busy}
        >
          <Text className="font-bold text-gray-800">Ubah password</Text>
          <Text className="mt-1 text-sm text-gray-500">
            Perbarui password akun Anda.
          </Text>
        </Pressable>

        <Pressable
          className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4"
          onPress={signOut}
          disabled={busy}
        >
          <Text className="font-bold text-red-700">Keluar</Text>
          <Text className="mt-1 text-sm text-red-600">
            Hapus session dari perangkat ini.
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
