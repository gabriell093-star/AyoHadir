import type { ExpoConfig } from "expo/config";

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY wajib tersedia saat build."
  );
}

const config: ExpoConfig = {
  name: "AyoHadir!",
  slug: "ayohadir",
  version: "0.3.5",
  orientation: "portrait",
  userInterfaceStyle: "light",
  scheme: "ayohadir",
  icon: "./assets/images/ayo-hadir-icon.png",
  android: {
    package: "com.ayohadir.app",
    adaptiveIcon: {
      backgroundColor: "#FFFFFF",
      foregroundImage: "./assets/images/ayo-hadir-icon.png"
    }
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-camera",
    "expo-image-picker",
    "expo-location",
    "expo-media-library"
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    supabaseUrl,
    supabasePublishableKey
  }
};

export default config;
