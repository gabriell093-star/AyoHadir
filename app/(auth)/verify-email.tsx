import { useState } from "react";
import * as Linking from "expo-linking";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { supabase } from "@/lib/supabase";

function firstParam(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const email = firstParam(params.email) ?? "";
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(
    "Buka email verifikasi yang kami kirim, lalu tekan tautannya untuk mengaktifkan akun."
  );

  const resend = async () => {
    if (!email) {
      setNotice("Alamat email tidak tersedia.");
      return;
    }

    setBusy(true);
    setNotice("");

    const redirectTo = Linking.createURL("auth/callback");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo }
    });

    if (error) {
      setNotice("Email verifikasi tidak dapat dikirim ulang. Coba lagi beberapa saat.");
    } else {
      setNotice("Email verifikasi dikirim ulang. Cek kotak masuk dan folder spam.");
    }

    setBusy(false);
  };

  return (
    <View className="flex-1 justify-center bg-[#FAF9F6] px-6">
      <View className="items-center gap-5 rounded-[28px] border border-[#C5C8B8]/50 bg-white p-6 shadow-sm">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#F2F5E8]">
          <Text className="text-3xl">✉️</Text>
        </View>

        <View className="items-center gap-2">
          <Text className="text-center text-2xl font-extrabold text-gray-950">
            Verifikasi email
          </Text>
          <Text className="text-center text-sm leading-5 text-gray-500">
            {email || "Periksa inbox Anda."}
          </Text>
        </View>

        <Text className="text-center text-sm leading-6 text-gray-600">
          {notice}
        </Text>

        <Pressable
          className={[
            "w-full items-center rounded-2xl bg-[#3E5219] px-4 py-4",
            busy ? "opacity-60" : ""
          ].join(" ")}
          onPress={resend}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-bold text-white">Kirim ulang email</Text>
          )}
        </Pressable>

        <Pressable
          className="w-full items-center rounded-2xl border border-gray-200 bg-white px-4 py-4"
          onPress={() => router.replace("/sign-in")}
          disabled={busy}
        >
          <Text className="font-bold text-gray-800">Kembali ke masuk</Text>
        </Pressable>
      </View>
    </View>
  );
}
