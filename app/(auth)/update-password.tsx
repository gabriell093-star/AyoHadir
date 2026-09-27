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
import { useRouter } from "expo-router";

import { useAuth } from "@/auth/auth-context";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    setNotice(null);

    if (!session) {
      setNotice("Sesi reset password belum aktif. Buka kembali tautan dari email.");
      return;
    }

    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password.length < 8 || !hasLetter || !hasNumber) {
      setNotice(
        "Password minimal 8 karakter dan harus mengandung huruf serta angka."
      );
      return;
    }

    if (password !== confirmation) {
      setNotice("Konfirmasi password tidak sama.");
      return;
    }

    setBusy(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setNotice(error.message);
    } else {
      setNotice("Password berhasil diperbarui.");
      setPassword("");
      setConfirmation("");
      setTimeout(() => router.replace("/"), 500);
    }

    setBusy(false);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 justify-center px-6">
        <View className="gap-5 rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <View className="gap-2">
            <Text className="text-2xl font-extrabold text-gray-950">
              Password baru
            </Text>
            <Text className="text-sm leading-5 text-gray-500">
              Buat password baru untuk akun AyoHadir! Anda.
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-700">
              Password baru
            </Text>
            <TextInput
              className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-950"
              value={password}
              onChangeText={setPassword}
              placeholder="Minimal 8 karakter, huruf + angka"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              secureTextEntry
              editable={!busy}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-700">
              Konfirmasi password
            </Text>
            <TextInput
              className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-950"
              value={confirmation}
              onChangeText={setConfirmation}
              placeholder="Ulangi password"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              secureTextEntry
              editable={!busy}
            />
          </View>

          {notice ? (
            <View className="rounded-2xl bg-emerald-50 px-4 py-3">
              <Text className="text-sm leading-5 text-emerald-800">{notice}</Text>
            </View>
          ) : null}

          <Pressable
            className={[
              "items-center rounded-2xl bg-emerald-500 px-4 py-4",
              busy ? "opacity-60" : ""
            ].join(" ")}
            onPress={submit}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-bold text-white">Simpan password</Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}