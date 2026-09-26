import { supabase } from "@/lib/supabase";

export type AuthRedirectParams = {
  code?: string;
  access_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
};

const processedCodes = new Set<string>();

export async function handleAuthRedirectParams(
  params: AuthRedirectParams
): Promise<void> {
  const description = params.error_description ?? params.error;

  if (description) {
    throw new Error(description);
  }

  if (params.code) {
    if (processedCodes.has(params.code)) {
      return;
    }

    processedCodes.add(params.code);

    const { error } = await supabase.auth.exchangeCodeForSession(params.code);

    if (error) {
      processedCodes.delete(params.code);
      throw error;
    }

    return;
  }

  if (params.access_token && params.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token
    });

    if (error) {
      throw error;
    }
  }
}
