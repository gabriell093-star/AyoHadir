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
    blockedPermissions: [
      "android.permission.RECORD_AUDIO",
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.USE_BIOMETRIC",
      "android.permission.READ_MEDIA_AUDIO",
      "android.permission.READ_MEDIA_VIDEO"
    ],
    versionCode: 35,
    adaptiveIcon: {
      backgroundColor: "#FFFFFF",
      foregroundImage: "./assets/images/ayo-hadir-icon.png"
    }
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-camera",
      {
        "recordAudioAndroid": false
      }
    ],
    "expo-image-picker",
    "expo-location",
    [
      "expo-media-library",
      {
        "granularPermissions": ["photo"]
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    supabaseUrl,
    supabasePublishableKey,
    eas: {
      projectId: "ace4e045-28f8-456f-8db6-17840e335450"
    }
  }
};

export default config;
