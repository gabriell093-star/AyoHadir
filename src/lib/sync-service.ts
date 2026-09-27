import { AppState } from "react-native";
import { getPendingAttendanceQueue, markAttendanceQueueStatus } from "@/lib/attendance-queue";
import { invokeEdgeFunction } from "@/lib/backend";
import { supabase } from "@/lib/supabase";

const HEALTH_URL = "https://sqrvntrxoytjnbgticpd.supabase.co/auth/v1/health";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Sinkronisasi gagal.";
}

export async function isBackendOnline() {
  try {
    const response = await fetch(HEALTH_URL);
    return response.ok;
  } catch {
    return false;
  }
}

export async function syncPendingAttendance(userId?: string) {
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
        latitude: item.latitude,
        longitude: item.longitude,
        accuracy: item.accuracy,
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
        // Notification failure must not block the retry state of the queue item.
      }
      delayed += 1;
    }
  }

  return { synced, delayed };
}

export function startForegroundSync(userId?: string) {
  if (!userId) return () => {};

  let active = true;
  let running = false;

  const attempt = async () => {
    if (!active || running) return;
    running = true;
    try {
      await syncPendingAttendance(userId);
    } catch {
      // Keep the foreground retry loop alive if local storage or another unexpected
      // synchronization error occurs.
    } finally {
      running = false;
    }
  };

  void attempt();
  const interval = setInterval(() => void attempt(), 60_000);
  const subscription = AppState.addEventListener("change", state => {
    if (state === "active") void attempt();
  });

  return () => {
    active = false;
    clearInterval(interval);
    subscription.remove();
  };
}
