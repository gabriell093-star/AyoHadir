import { ScrollView, Text, View } from "react-native";

import { AppCard } from "@/components/app-card";
import { useAppStore } from "@/state/app-store";

export default function HomeScreen() {
  const isOnline = useAppStore((state) => state.isOnline);

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-5 px-5 pb-8 pt-6"
    >
      <View className="gap-2">
        <Text className="text-[28px] font-bold text-gray-950">
          Halo, AyoHadir 👋
        </Text>
        <Text className="text-base text-gray-500">
          Foundation Expo sudah aktif.
        </Text>
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
            Status foundation
          </Text>
          <Text className="text-xl font-bold text-gray-900">
            Expo React Native + TypeScript
          </Text>
          <Text className="text-sm leading-5 text-gray-500">
            UI produk belum dibangun di tahap ini. Layar ini hanya memverifikasi
            routing dan styling foundation.
          </Text>
        </View>
      </AppCard>

      <AppCard>
        <Text className="text-base font-semibold text-gray-900">
          Tahap berikutnya
        </Text>
        <Text className="mt-2 text-sm leading-5 text-gray-500">
          Autentikasi dan session akan menjadi fitur pertama setelah foundation
          tervalidasi.
        </Text>
      </AppCard>
    </ScrollView>
  );
}
