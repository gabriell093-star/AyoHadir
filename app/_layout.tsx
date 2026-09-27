import "../global.css";

import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "@/auth/auth-context";

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    const first = segments[0];
    const second = segments[1];
    const isPasswordRecoveryRoute =
      first === "(auth)" && second === "update-password";
    const isPublicRoute =
      first === "(auth)" ||
      first === "auth" ||
      first === "sign-in" ||
      first === "verify-email" ||
      first === "forgot-password" ||
      first === "update-password" ||
      first === "welcome";

    if (!session && !isPublicRoute) {
      router.replace("/welcome");
      return;
    }

    if (session && isPublicRoute && first !== "auth" && !isPasswordRecoveryRoute) {
      router.replace("/");
    }
  }, [loading, router, segments, session]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View className="flex-1 bg-[#FAF9F6]">
        <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FFFFFF" }
        }}
      />
        {loading ? (
          <View className="absolute inset-0 items-center justify-center bg-white">
            <ActivityIndicator color="#3E5219" size="large" />
          </View>
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
