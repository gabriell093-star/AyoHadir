import * as Linking from "expo-linking";

export type ServerQrPayload = { qr_id: string; token: string; token_expires_at?: string; gps_enabled?: boolean };
function first(value: string | string[] | null | undefined): string | undefined { return Array.isArray(value) ? value[0] : value ?? undefined; }

export function createQrPayload(value: ServerQrPayload): string { return JSON.stringify(value); }

export function parseQrPayload(rawValue: string): ServerQrPayload {
  const trimmed = rawValue.trim();
  try {
    const parsed = JSON.parse(trimmed) as Partial<ServerQrPayload>;
    if (typeof parsed.qr_id === "string" && typeof parsed.token === "string") {
      return { qr_id: parsed.qr_id, token: parsed.token, ...(typeof parsed.token_expires_at === "string" ? { token_expires_at: parsed.token_expires_at } : {}), ...(typeof parsed.gps_enabled === "boolean" ? { gps_enabled: parsed.gps_enabled } : {}) };
    }
  } catch {}
  const parsedUrl = Linking.parse(trimmed);
  const query = parsedUrl.queryParams ?? {};
  const qrId = first(query.qr_id); const token = first(query.token); const expires = first(query.token_expires_at);
  const gpsRaw = first(query.gps_enabled);
  const gpsEnabled = gpsRaw === "true" ? true : gpsRaw === "false" ? false : undefined;
  if (qrId && token) return { qr_id: qrId, token, ...(expires ? { token_expires_at: expires } : {}), ...(gpsEnabled === undefined ? {} : { gps_enabled: gpsEnabled }) };
  throw new Error("QR tidak valid atau bukan QR AyoHadir.");
}
