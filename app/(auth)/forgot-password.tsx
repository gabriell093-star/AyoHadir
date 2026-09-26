import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";

import { supabase } from "@/lib/supabase";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setNotice(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setNotice("Masukkan email yang valid.");
      setBusy(false);
      return;
    }

    const redirectTo =
      Linking.createURL("auth/callback") + "?next=%2Fupdate-password";

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      { redirectTo }
    );

    if (error) {
      setNotice(error.message);
    } else {
      setNotice(
        "Jika akun dengan email tersebut tersedia, tautan reset password telah dikirim. Cek inbox dan folder spam."
      );
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
              Reset password
            </Text>
            <Text className="text-sm leading-5 text-gray-500">
              Masukkan email akun AyoHadir!. Tautan reset akan membuka aplikasi
              kembali.
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-700">Email</Text>
            <TextInput
              className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-950"
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
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
              <Text className="font-bold text-white">Kirim tautan reset</Text>
            )}
          </Pressable>

          <Pressable
            className="items-center rounded-2xl border border-gray-200 bg-white px-4 py-4"
            onPress={() => router.replace("/sign-in")}
            disabled={busy}
          >
            <Text className="font-bold text-gray-800">Kembali ke masuk</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
