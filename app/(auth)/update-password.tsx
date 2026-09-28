import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AyoHadirLogo } from "@/components/ui";
import { useAuth } from "@/auth/auth-context";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ mode?: string | string[] }>();
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const isRecovery = mode === "recovery";

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    setNotice(null);

    if (!isRecovery && !currentPassword) {
      setNotice("Masukkan password saat ini untuk mengubah password akun.");
      return;
    }

    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password.length < 8 || !hasLetter || !hasNumber) {
      setNotice("Password minimal 8 karakter dan harus mengandung huruf serta angka.");
      return;
    }

    if (password !== confirmation) {
      setNotice("Konfirmasi password tidak sama.");
      return;
    }

    if (currentPassword && currentPassword === password) {
      setNotice("Password baru harus berbeda dari password saat ini.");
      return;
    }

    setBusy(true);

    if (!isRecovery) {
      if (!user?.email) {
        setNotice("Email akun tidak tersedia. Silakan masuk kembali.");
        setBusy(false);
        return;
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      if (verifyError) {
        setNotice("Password saat ini tidak benar.");
        setBusy(false);
        return;
      }
    }

    const { error } = isRecovery
      ? await supabase.auth.updateUser({ password })
      : await supabase.auth.updateUser({
          password,
          current_password: currentPassword
        });

    if (error) {
      setNotice("Password tidak dapat diperbarui. Pastikan password saat ini benar dan coba lagi.");
    } else {
      setNotice("Password berhasil diperbarui.");
      setCurrentPassword("");
      setPassword("");
      setConfirmation("");
      if (isRecovery) {
        setTimeout(() => router.replace("/"), 700);
      }
    }

    setBusy(false);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#FAF9F6]" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View className="flex-1 justify-center px-6 py-8">
        <View className="w-full self-center rounded-[28px] border border-[#C5C8B8]/50 bg-white p-6">
          <View className="items-center">
            <AyoHadirLogo size={68} />
            <Text className="mt-3 text-2xl font-black text-[#3E5219]">
              {isRecovery ? "Reset Password" : "Ubah Password"}
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-gray-500">
              {isRecovery
                ? "Tautan pemulihan berhasil dibuka. Buat password baru untuk akun AyoHadir! Anda."
                : "Perbarui password akun dengan memasukkan password yang sedang digunakan."}
            </Text>
          </View>

          <View className="mt-6 gap-4">
            {!isRecovery ? (
              <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700">Password saat ini</Text>
                <TextInput
                  className="rounded-2xl border border-[#C5C8B8] bg-[#FAF9F6] px-4 py-4 text-base text-gray-950"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Masukkan password saat ini"
                  placeholderTextColor="#8A8D82"
                  autoCapitalize="none"
                  secureTextEntry
                  editable={!busy}
                />
              </View>
            ) : null}

            <View className="gap-2">
              <Text className="text-sm font-semibold text-gray-700">Password baru</Text>
              <TextInput
                className="rounded-2xl border border-[#C5C8B8] bg-[#FAF9F6] px-4 py-4 text-base text-gray-950"
                value={password}
                onChangeText={setPassword}
                placeholder="Minimal 8 karakter, huruf + angka"
                placeholderTextColor="#8A8D82"
                autoCapitalize="none"
                secureTextEntry
                editable={!busy}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-gray-700">Konfirmasi password</Text>
              <TextInput
                className="rounded-2xl border border-[#C5C8B8] bg-[#FAF9F6] px-4 py-4 text-base text-gray-950"
                value={confirmation}
                onChangeText={setConfirmation}
                placeholder="Ulangi password baru"
                placeholderTextColor="#8A8D82"
                autoCapitalize="none"
                secureTextEntry
                editable={!busy}
              />
            </View>
          </View>

          {notice ? (
            <View className="mt-4 rounded-2xl border border-[#DDE8C9] bg-[#F2F5E8] px-4 py-3">
              <Text className="text-sm leading-5 text-[#2F4014]">{notice}</Text>
            </View>
          ) : null}

          <Pressable
            className={"mt-5 min-h-12 items-center justify-center rounded-2xl bg-[#3E5219] px-4 py-4 " + (busy ? "opacity-60" : "")}
            onPress={submit}
            disabled={busy}
          >
            {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text className="font-bold text-white">Simpan password</Text>}
          </Pressable>

          <Pressable className="mt-3 items-center py-3" onPress={() => router.back()} disabled={busy}>
            <Text className="text-sm font-bold text-[#3E5219]">Kembali</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
