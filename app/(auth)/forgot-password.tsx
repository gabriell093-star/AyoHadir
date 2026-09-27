import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";

import { supabase } from "@/lib/supabase";
import { AyoHadirLogo, PrimaryButton, SecondaryButton, ButtonText } from "@/components/ui";

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

    const redirectTo = Linking.createURL("auth/callback") + "?next=%2Fupdate-password";
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });

    if (error) {
      setNotice(error.message);
    } else {
      setNotice("Jika akun dengan email tersebut tersedia, tautan reset password telah dikirim. Cek inbox dan folder spam.");
    }
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#FAF9F6]" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View className="flex-1 justify-center px-6">
        <View className="mx-auto w-full max-w-md rounded-[28px] border border-[#DDE8C9] bg-white p-6 shadow-sm">
          <View className="items-center">
            <AyoHadirLogo size={72} />
            <Text className="mt-3 text-2xl font-black text-[#3E5219]">Lupa Kata Sandi</Text>
            <Text className="mt-2 text-center text-sm leading-5 text-gray-500">Masukkan email akun AyoHadir! untuk menerima instruksi pemulihan.</Text>
          </View>

          <View className="mt-6">
            <Text className="text-sm font-bold text-gray-800">Email</Text>
            <View className="mt-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5">
              <TextInput value={email} onChangeText={setEmail} placeholder="nama@email.com" placeholderTextColor="#94A3B8" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" editable={!busy} className="text-base text-gray-900" />
            </View>
          </View>

          {notice ? <View className="mt-4 rounded-2xl bg-[#F2F5E8] px-4 py-3"><Text className="text-sm leading-5 text-[#2F4014]">{notice}</Text></View> : null}

          <PrimaryButton className="mt-5" onPress={submit} disabled={busy}>
            {busy ? <ActivityIndicator color="#FFFFFF" /> : <ButtonText>Kirim Instruksi</ButtonText>}
          </PrimaryButton>
          <SecondaryButton className="mt-3" onPress={() => router.replace("/sign-in")}><Text className="text-sm font-bold text-gray-800">Kembali ke Login</Text></SecondaryButton>
          <Text className="mt-5 text-center text-xs leading-5 text-gray-400">Tidak menerima email? Periksa folder spam atau hubungi dukungan.</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
