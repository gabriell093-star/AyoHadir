import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { Link, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { handleAuthRedirectParams } from "@/lib/auth-redirect";
import { supabase } from "@/lib/supabase";

type Mode = "signIn" | "register";

function firstParam(
  value: string | string[] | null | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

export default function SignInScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isRegister = mode === "register";

  const run = async (action: () => Promise<void>) => {
    setMessage(null);
    setBusy(true);

    try {
      await action();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi."
      );
    } finally {
      setBusy(false);
    }
  };

  const submit = () =>
    run(async () => {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail || !normalizedEmail.includes("@")) {
        throw new Error("Masukkan email yang valid.");
      }

      if (password.length < 6) {
        throw new Error("Password minimal 6 karakter.");
      }

      if (isRegister) {
        const cleanedName = name.trim();

        if (!cleanedName) {
          throw new Error("Nama wajib diisi.");
        }

        if (password !== confirmation) {
          throw new Error("Konfirmasi password tidak sama.");
        }

        const redirectTo = Linking.createURL("auth/callback");
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: cleanedName },
            emailRedirectTo: redirectTo
          }
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          router.replace("/");
          return;
        }

        router.replace({
          pathname: "/verify-email",
          params: { email: normalizedEmail }
        });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (error) {
        throw error;
      }

      router.replace("/");
    });

  const signInWithGoogle = () =>
    run(async () => {
      const redirectTo = Linking.createURL("auth/callback");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true
        }
      });

      if (error) {
        throw error;
      }

      if (!data.url) {
        throw new Error("Tautan login Google tidak tersedia.");
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      if (result.type !== "success" || !result.url) {
        return;
      }

      const parsed = Linking.parse(result.url);
      const query = parsed.queryParams ?? {};

      await handleAuthRedirectParams({
        code: firstParam(query.code),
        access_token: firstParam(query.access_token),
        refresh_token: firstParam(query.refresh_token),
        error: firstParam(query.error),
        error_description: firstParam(query.error_description)
      });

      router.replace("/");
    });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="flex-grow justify-center px-6 py-10"
      >
        <View className="gap-6">
          <View className="items-center gap-2">
            <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-emerald-500 shadow-sm">
              <Text className="text-2xl font-black text-white">A</Text>
            </View>
            <Text className="text-[32px] font-extrabold tracking-tight text-gray-950">
              AyoHadir!
            </Text>
            <Text className="text-center text-base text-gray-500">
              Absensi lebih mudah, aman, dan tetap fleksibel.
            </Text>
          </View>

          <View className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
            <View className="mb-5 flex-row rounded-2xl bg-gray-50 p-1">
              <Pressable
                className={[
                  "flex-1 items-center rounded-xl px-3 py-3",
                  !isRegister ? "bg-white shadow-sm" : ""
                ].join(" ")}
                onPress={() => setMode("signIn")}
              >
                <Text
                  className={[
                    "font-semibold",
                    !isRegister ? "text-gray-950" : "text-gray-500"
                  ].join(" ")}
                >
                  Masuk
                </Text>
              </Pressable>
              <Pressable
                className={[
                  "flex-1 items-center rounded-xl px-3 py-3",
                  isRegister ? "bg-white shadow-sm" : ""
                ].join(" ")}
                onPress={() => setMode("register")}
              >
                <Text
                  className={[
                    "font-semibold",
                    isRegister ? "text-gray-950" : "text-gray-500"
                  ].join(" ")}
                >
                  Daftar
                </Text>
              </Pressable>
            </View>

            {isRegister ? (
              <View className="gap-2">
                <Text className="text-sm font-semibold text-gray-700">Nama</Text>
                <TextInput
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-950"
                  value={name}
                  onChangeText={setName}
                  placeholder="Nama lengkap"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  editable={!busy}
                />
              </View>
            ) : null}

            <View className="mt-4 gap-2">
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

            <View className="mt-4 gap-2">
              <Text className="text-sm font-semibold text-gray-700">Password</Text>
              <TextInput
                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-950"
                value={password}
                onChangeText={setPassword}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                editable={!busy}
              />
            </View>

            {isRegister ? (
              <View className="mt-4 gap-2">
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
                  autoCorrect={false}
                  secureTextEntry
                  editable={!busy}
                />
              </View>
            ) : (
              <Link
                href="/forgot-password"
                className="mt-3 self-end text-sm font-semibold text-emerald-600"
              >
                Lupa password?
              </Link>
            )}

            {message ? (
              <View className="mt-4 rounded-2xl bg-red-50 px-4 py-3">
                <Text className="text-sm leading-5 text-red-700">{message}</Text>
              </View>
            ) : null}

            <Pressable
              className={[
                "mt-5 items-center rounded-2xl bg-emerald-500 px-4 py-4",
                busy ? "opacity-60" : ""
              ].join(" ")}
              onPress={submit}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-bold text-white">
                  {isRegister ? "Buat akun" : "Masuk"}
                </Text>
              )}
            </Pressable>

            <View className="my-5 flex-row items-center gap-3">
              <View className="h-px flex-1 bg-gray-200" />
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-gray-400">
                atau
              </Text>
              <View className="h-px flex-1 bg-gray-200" />
            </View>

            <Pressable
              className="items-center rounded-2xl border border-gray-200 bg-white px-4 py-4"
              onPress={signInWithGoogle}
              disabled={busy}
            >
              <Text className="text-base font-bold text-gray-800">
                Lanjut dengan Google
              </Text>
            </Pressable>
          </View>

          <Text className="px-4 text-center text-xs leading-5 text-gray-400">
            Dengan menggunakan AyoHadir!, Anda menyetujui penggunaan akun untuk
            kebutuhan autentikasi dan absensi.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
