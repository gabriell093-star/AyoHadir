import type { PropsWithChildren } from "react";
import { View } from "react-native";

export function AppCard({ children }: PropsWithChildren) {
  return (
    <View className="rounded-[20px] border border-gray-100 bg-white p-5">
      {children}
    </View>
  );
}
