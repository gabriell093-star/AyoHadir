import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Badge, ButtonText, GlassCard, PrimaryButton, Screen } from "@/components/ui";

export default function AttendanceSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string | string[]; status?: string | string[] }>();
  const code = Array.isArray(params.code) ? params.code[0] : params.code;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;

  return (
    <Screen>
      <View className="items-center pt-3">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-[#F2F5E8]">
          <Text className="text-5xl text-[#3E5219]">✓</Text>
        </View>
        <Text className="mt-5 text-2xl font-black text-gray-950">Absensi Berhasil!</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-gray-500">
          Kehadiran Anda sudah berhasil divalidasi server.
        </Text>
      </View>
      <GlassCard>
        <Text className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Kode Absensi</Text>
        <View className="mt-2 rounded-2xl bg-gray-50 px-4 py-4">
          <Text className="font-black tracking-[2px] text-gray-900">
            {code || "Tersedia pada bukti absensi"}
          </Text>
        </View>
        {status ? (
          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-xs text-gray-500">Status</Text>
            <Badge>{status}</Badge>
          </View>
        ) : null}
      </GlassCard>
      <PrimaryButton onPress={() => router.push("/screens/attendance-proof")}>
        <ButtonText>Lihat Bukti Absensi</ButtonText>
      </PrimaryButton>
    </Screen>
  );
}
