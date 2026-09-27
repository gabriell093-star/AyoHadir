import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
        animation: "shift"
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Beranda" }} />
      <Tabs.Screen name="history" options={{ title: "Riwayat" }} />
      <Tabs.Screen name="qr" options={{ title: "QR" }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifikasi" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
  );
}
