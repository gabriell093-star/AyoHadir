import { withSupabase } from 'npm:@supabase/server'
import { z } from 'npm:zod'

const bodySchema = z.object({ qr_id: z.string().uuid(), ttl_minutes: z.number().int().min(1).max(15).default(10) })

function publicError(error: unknown, fallback: string) {
  const raw = error instanceof Error ? error.message : "";
  if (/rate limit exceeded|too many/i.test(raw)) return { message: "Terlalu banyak permintaan. Coba lagi beberapa saat.", status: 429 };
  if (/email verification required/i.test(raw)) return { message: "Email perlu diverifikasi sebelum melanjutkan.", status: 400 };
  if (/not allowed|not authorized|only the qr owner|only the qr owner can|only active qr|only active/i.test(raw)) return { message: "Anda tidak memiliki akses untuk tindakan ini.", status: 403 };
  if (/already recorded|already cancelled|duplicate|already exists/i.test(raw)) return { message: "Tindakan ini sudah tercatat.", status: 409 };
  if (/gps|location|radius/i.test(raw)) return { message: "Lokasi tidak dapat diverifikasi untuk tindakan ini.", status: 400 };
  if (/rejection reason is required/i.test(raw)) return { message: "Alasan penolakan wajib diisi minimal 3 karakter.", status: 400 };
  if (/invalid request data/i.test(raw)) return { message: "Data permintaan tidak valid.", status: 400 };
  if (/invalid|expired|not active|not found/i.test(raw)) return { message: "Data yang digunakan sudah tidak valid atau tidak tersedia.", status: 400 };
  return { message: fallback, status: 400 };
}

Deno.serve(withSupabase({ auth: 'user' }, async (req, ctx) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  try {
    const body = bodySchema.parse(await req.json())
    const { data, error } = await ctx.supabase.rpc('server_rotate_qr_token', {
      p_owner_id: ctx.userClaims!.id,
      p_qr_id: body.qr_id,
      p_ttl: `${body.ttl_minutes} minutes`,
    })
    if (error) throw error
    return Response.json({ token: data?.[0]?.token, token_expires_at: data?.[0]?.expires_at })
  } catch (error) {
    const result = publicError(error, "Token QR tidak dapat diperbarui. Coba lagi.");
    return Response.json({ error: result.message }, { status: result.status });
  }
}))