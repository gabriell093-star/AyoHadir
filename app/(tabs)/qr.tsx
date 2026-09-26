import { ScrollView, Text, View } from "react-native";

export default function QrScreen() {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="flex-1 items-center justify-center gap-4 px-5"
    >
      <View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-500">
        <Text className="text-3xl font-bold text-white">QR</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-900">Aksi QR</Text>
      <Text className="text-center text-base leading-6 text-gray-500">
        Buat QR dan Scan QR akan diimplementasikan setelah foundation selesai.
      </Text>
    </ScrollView>
  );
}
