import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import type { SupportedStorage } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Konfigurasi Supabase aplikasi belum tersedia.");
}

const SECURE_STORE_CHUNK_SIZE = 1500;
const CHUNK_COUNT_SUFFIX = "__chunk_count";
const CHUNK_SUFFIX = "__chunk_";

const secureStorage: SupportedStorage = {
  async getItem(key) {
    const countValue = await SecureStore.getItemAsync(
      key + CHUNK_COUNT_SUFFIX
    );

    if (countValue) {
      const count = Number.parseInt(countValue, 10);

      if (Number.isInteger(count) && count > 0) {
        const chunks = await Promise.all(
          Array.from({ length: count }, (_, index) =>
            SecureStore.getItemAsync(key + CHUNK_SUFFIX + index)
          )
        );

        return chunks.every((chunk) => chunk !== null)
          ? chunks.join("")
          : null;
      }
    }

    return SecureStore.getItemAsync(key);
  },

  async setItem(key, value) {
    const previousCountValue = await SecureStore.getItemAsync(
      key + CHUNK_COUNT_SUFFIX
    );
    const previousCount = previousCountValue
      ? Number.parseInt(previousCountValue, 10)
      : 0;

    await SecureStore.deleteItemAsync(key);

    if (value.length <= SECURE_STORE_CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);

      if (previousCount > 0) {
        await Promise.all(
          Array.from({ length: previousCount }, (_, index) =>
            SecureStore.deleteItemAsync(key + CHUNK_SUFFIX + index)
          )
        );
      }

      await SecureStore.deleteItemAsync(key + CHUNK_COUNT_SUFFIX);
      return;
    }

    const chunks = [];
    for (let index = 0; index < value.length; index += SECURE_STORE_CHUNK_SIZE) {
      chunks.push(value.slice(index, index + SECURE_STORE_CHUNK_SIZE));
    }

    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(key + CHUNK_SUFFIX + index, chunk)
      )
    );
    await SecureStore.setItemAsync(
      key + CHUNK_COUNT_SUFFIX,
      String(chunks.length)
    );

    if (previousCount > chunks.length) {
      await Promise.all(
        Array.from(
          { length: previousCount - chunks.length },
          (_, index) =>
            SecureStore.deleteItemAsync(
              key + CHUNK_SUFFIX + (chunks.length + index)
            )
        )
      );
    }
  },

  async removeItem(key) {
    const countValue = await SecureStore.getItemAsync(
      key + CHUNK_COUNT_SUFFIX
    );
    const count = countValue ? Number.parseInt(countValue, 10) : 0;

    await SecureStore.deleteItemAsync(key);
    await SecureStore.deleteItemAsync(key + CHUNK_COUNT_SUFFIX);

    if (count > 0) {
      await Promise.all(
        Array.from({ length: count }, (_, index) =>
          SecureStore.deleteItemAsync(key + CHUNK_SUFFIX + index)
        )
      );
    }
  }
};

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: "pkce"
  }
});
