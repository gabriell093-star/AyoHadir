import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
          backgroundColor: "#FFFFFF"
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Beranda", tabBarLabel: "Beranda" }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: "Riwayat", tabBarLabel: "Riwayat" }}
      />
      <Tabs.Screen name="qr" options={{ title: "QR", tabBarLabel: "QR" }} />
      <Tabs.Screen
        name="notifications"
        options={{ title: "Notifikasi", tabBarLabel: "Notifikasi" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profil", tabBarLabel: "Profil" }}
      />
    </Tabs>
  );
}
