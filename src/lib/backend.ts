import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export class BackendFunctionError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "BackendFunctionError";
    this.code = code;
  }
}

type FunctionErrorBody = { message?: string; error?: string; error_code?: string; code?: string };

const PUBLIC_ERRORS: Array<[RegExp, string]> = [
  [/email verification required/i, "Email perlu diverifikasi sebelum melanjutkan."],
  [/not allowed|not authorized|only the qr owner/i, "Anda tidak memiliki akses untuk tindakan ini."],
  [/already recorded|already cancelled|duplicate/i, "Tindakan ini sudah tercatat."],
  [/invalid|expired|not active|not found/i, "Data yang digunakan sudah tidak valid atau tidak tersedia."],
  [/gps|location|radius/i, "Lokasi tidak dapat diverifikasi untuk tindakan ini."],
  [/rate limit|too many/i, "Terlalu banyak permintaan. Coba lagi beberapa saat."],
  [/authentication required|unauthenticated/i, "Sesi pengguna tidak valid. Silakan masuk kembali."],
];

function publicErrorMessage(value: string | undefined): string {
  if (!value) return "Permintaan server gagal.";
  const match = PUBLIC_ERRORS.find(([pattern]) => pattern.test(value));
  return match?.[1] ?? "Permintaan tidak dapat diproses. Coba lagi.";
}

export async function invokeEdgeFunction<T>(functionName: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, { body });
  if (error) {
    let detail: FunctionErrorBody | null = null;
    if (error instanceof FunctionsHttpError) {
      try { detail = (await error.context.json()) as FunctionErrorBody; } catch { detail = null; }
    } else if (error instanceof FunctionsRelayError || error instanceof FunctionsFetchError) {
      detail = null;
    }
    throw new BackendFunctionError(
      publicErrorMessage(detail?.message ?? detail?.error ?? error.message),
      detail?.error_code ?? detail?.code
    );
  }
  if (data == null) throw new BackendFunctionError("Server tidak mengembalikan data.");
  return data as T;
}
