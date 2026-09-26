import { ScrollView, Text } from "react-native";

export default function NotificationsScreen() {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="px-5 pb-8 pt-6"
    >
      <Text className="text-[28px] font-bold text-gray-950">Notifikasi</Text>
      <Text className="mt-2 text-base text-gray-500">
        Notifikasi akan terhubung setelah modul akun dan attendance tersedia.
      </Text>
    </ScrollView>
  );
}
