import { ScrollView, Text } from "react-native";

export default function ProfileScreen() {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="px-5 pb-8 pt-6"
    >
      <Text className="text-[28px] font-bold text-gray-950">Profil</Text>
      <Text className="mt-2 text-base text-gray-500">
        Profil, keamanan, panduan, dan logout akan dibangun setelah autentikasi.
      </Text>
    </ScrollView>
  );
}
