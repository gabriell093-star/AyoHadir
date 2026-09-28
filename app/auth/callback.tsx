import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { handleAuthRedirectParams } from "@/lib/auth-redirect";

function firstParam(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string | string[];
    access_token?: string | string[];
    refresh_token?: string | string[];
    error?: string | string[];
    error_description?: string | string[];
    type?: string | string[];
    next?: string | string[];
  }>();
  const processed = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (processed.current) {
      return;
    }

    processed.current = true;

    const type = firstParam(params.type);
    const next = firstParam(params.next);
    const safeNext =
      type === "recovery" || next === "/update-password"
        ? "/update-password"
        : "/";

    void handleAuthRedirectParams({
      code: firstParam(params.code),
      access_token: firstParam(params.access_token),
      refresh_token: firstParam(params.refresh_token),
      error: firstParam(params.error),
      error_description: firstParam(params.error_description)
    })
      .then(() => {
        router.replace(safeNext === "/update-password" ? "/update-password?mode=recovery" : "/");
      })
      .catch((error: unknown) => {
        setErrorMessage(
          "Autentikasi gagal atau tautan sudah tidak berlaku. Coba lagi."
        );
      });
  }, [params, router]);

  if (!errorMessage) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF9F6] px-6">
        <ActivityIndicator color="#3E5219" size="large" />
        <Text className="mt-4 text-center text-sm text-gray-500">
          Memproses autentikasi...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-[#FAF9F6] px-6">
      <View className="w-full gap-4 rounded-[28px] border border-red-100 bg-white p-6 shadow-sm">
        <Text className="text-xl font-extrabold text-gray-950">
          Autentikasi gagal
        </Text>
        <Text className="text-sm leading-5 text-red-700">{errorMessage}</Text>
        <Pressable
          className="items-center rounded-2xl bg-[#3E5219] px-4 py-4"
          onPress={() => router.replace("/sign-in")}
        >
          <Text className="font-bold text-white">Kembali ke masuk</Text>
        </Pressable>
      </View>
    </View>
  );
}
