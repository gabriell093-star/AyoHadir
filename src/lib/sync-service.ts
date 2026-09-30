import { AppState } from "react-native";
import * as SecureStore from "expo-secure-store";

import {
  getPendingAttendanceQueue,
  markAttendanceQueueStatus
} from "@/lib/attendance-queue";
import { invokeEdgeFunction } from "@/lib/backend";
import { supabase } from "@/lib/supabase";

const HEALTH_URL =
  "https://sqrvntrxoytjnbgticpd.supabase.co/auth/v1/health";
const AUTO_SYNC_KEY = "ayohadir_auto_sync_enabled_v1";

let activeSync: Promise<{ synced: number; delayed: number }> | null = null;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Sinkronisasi gagal.";
}

export async function isBackendOnline() {
  try {
    const response = await fetch(HEALTH_URL);
    // A 401/403 proves the Supabase endpoint is reachable; only 5xx
    // (or a network exception) should be treated as backend outage.
    return response.status < 500;
  } catch {
    return false;
  }
}

async function isAutoSyncEnabled() {
  const value = await SecureStore.getItemAsync(AUTO_SYNC_KEY);
  return value !== "false";
}

export async function syncPendingAttendance(userId?: string) {
  if (activeSync) {
    return activeSync;
  }

  activeSync = (async () => {
    if (!userId || !(await isBackendOnline())) {
      return { synced: 0, delayed: 0 };
    }

    let synced = 0;
    let delayed = 0;

    for (const item of await getPendingAttendanceQueue()) {
      try {
        await invokeEdgeFunction("record-attendance", {
          qr_id: item.qr_id,
          token: item.token,
          scanned_at: item.scanned_at,
          device_id_hash: item.device_id_hash,
          device_name: item.device_name,
          latitude: item.latitude,
          longitude: item.longitude,
          accuracy_meters: item.accuracy,
          sync_status: "pending",
          client_event_id: item.client_event_id
        });

        await markAttendanceQueueStatus(
          item.client_event_id,
          "Tersinkronisasi"
        );
        synced += 1;
      } catch (error) {
        const reason = errorMessage(error);

        await markAttendanceQueueStatus(
          item.client_event_id,
          "Sinkronisasi tertunda",
          reason
        );

        try {
          await supabase.rpc("notify_sync_delayed", {
            p_user_id: userId,
            p_client_event_id: item.client_event_id,
            p_qr_id: item.qr_id,
            p_reason: reason
          });
        } catch {
          // Notification failure must not block the queue retry state.
        }

        delayed += 1;
      }
    }

    return { synced, delayed };
  })();

  try {
    return await activeSync;
  } finally {
    activeSync = null;
  }
}

export function startForegroundSync(userId?: string) {
  if (!userId) {
    return () => {};
  }

  let active = true;
  let running = false;

  const attempt = async () => {
    if (!active || running || !(await isAutoSyncEnabled())) {
      return;
    }

    running = true;

    try {
      await syncPendingAttendance(userId);
    } catch {
      // Keep the foreground retry loop alive after an unexpected failure.
    } finally {
      running = false;
    }
  };

  void attempt();

  const interval = setInterval(() => {
    void attempt();
  }, 60_000);

  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      void attempt();
    }
  });

  return () => {
    active = false;
    clearInterval(interval);
    subscription.remove();
  };
}
