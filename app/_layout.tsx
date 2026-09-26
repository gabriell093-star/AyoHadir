import "../global.css";

import { Stack, useRouter, useSegments } from "expo-router";
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
    const isPublicRoute =
      first === "(auth)" ||
      first === "auth" ||
      first === "sign-in" ||
      first === "verify-email" ||
      first === "forgot-password" ||
      first === "update-password";

    if (!session && !isPublicRoute) {
      router.replace("/sign-in");
      return;
    }

    if (session && isPublicRoute && first !== "auth") {
      router.replace("/");
    }
  }, [loading, router, segments, session]);

  return (
    <View className="flex-1 bg-white">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FFFFFF" }
        }}
      />
      {loading ? (
        <View className="absolute inset-0 items-center justify-center bg-white">
          <ActivityIndicator color="#10B981" size="large" />
        </View>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
