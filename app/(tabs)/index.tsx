import { ScrollView, Text, View } from "react-native";

import { AppCard } from "@/components/app-card";
import { useAppStore } from "@/state/app-store";
import { useAuth } from "@/auth/auth-context";

export default function HomeScreen() {
  const isOnline = useAppStore((state) => state.isOnline);
  const { profile, user } = useAuth();

  const displayName =
    profile?.display_name ??
    (typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "Pengguna");

  const emailVerified = Boolean(user?.email_confirmed_at);

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-5 px-5 pb-8 pt-6"
    >
      <View className="gap-2">
        <Text className="text-[28px] font-bold text-gray-950">
          Halo, {displayName} 👋
        </Text>

        <View
          className={[
            "self-start rounded-full px-3 py-1.5",
            emailVerified ? "bg-emerald-50" : "bg-amber-50"
          ].join(" ")}
        >
          <Text
            className={[
              "text-sm font-semibold",
              emailVerified ? "text-emerald-700" : "text-amber-700"
            ].join(" ")}
          >
            {emailVerified ? "✓ Email Terverifikasi" : "Email Belum Terverifikasi"}
          </Text>
        </View>
      </View>

      <View
        className={[
          "rounded-full px-4 py-2",
          isOnline ? "bg-emerald-50" : "bg-amber-50"
        ].join(" ")}
      >
        <Text
          className={[
            "text-center text-sm font-semibold",
            isOnline ? "text-emerald-700" : "text-amber-700"
          ].join(" ")}
        >
          {isOnline ? "Online" : "Offline"}
        </Text>
      </View>

      <AppCard>
        <View className="gap-2">
          <Text className="text-sm font-medium text-gray-500">
            Status akun
          </Text>
          <Text className="text-xl font-bold text-gray-900">
            {emailVerified ? "Akun siap digunakan" : "Verifikasi email Anda"}
          </Text>
          <Text className="text-sm leading-5 text-gray-500">
            Verifikasi email wajib sebelum fitur absensi digunakan.
          </Text>
        </View>
      </AppCard>

      <AppCard>
        <Text className="text-base font-semibold text-gray-900">
          Tahap berikutnya
        </Text>
        <Text className="mt-2 text-sm leading-5 text-gray-500">
          Fondasi autentikasi dan session sudah terhubung. Fitur QR, GPS, dan
          sinkronisasi offline akan dibangun di tahap berikutnya.
        </Text>
      </AppCard>
    </ScrollView>
  );
}
