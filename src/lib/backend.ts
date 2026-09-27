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

export async function invokeEdgeFunction<T>(functionName: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, { body });
  if (error) {
    let detail: FunctionErrorBody | null = null;
    if (error instanceof FunctionsHttpError) {
      try { detail = (await error.context.json()) as FunctionErrorBody; } catch { detail = null; }
    } else if (error instanceof FunctionsRelayError || error instanceof FunctionsFetchError) {
      detail = null;
    }
    throw new BackendFunctionError(detail?.message ?? detail?.error ?? error.message ?? "Permintaan server gagal.", detail?.error_code ?? detail?.code);
  }
  if (data == null) throw new BackendFunctionError("Server tidak mengembalikan data.");
  return data as T;
}
