import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const DEVICE_ID_KEY = "ayohadir_device_installation_id_v1";

export async function getDeviceIdHash(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = Crypto.randomUUID();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  }
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, deviceId);
}
