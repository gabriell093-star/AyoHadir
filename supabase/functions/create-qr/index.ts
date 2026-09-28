import { withSupabase } from 'npm:@supabase/server'
import { z } from 'npm:zod'

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  target_mode: z.enum(['all_users', 'specific_users']),
  starts_at: z.string().datetime({ offset: true }),
  ends_at: z.string().datetime({ offset: true }),
  late_after_minutes: z.number().int().min(0).max(1440).default(0),
  gps_enabled: z.boolean().default(false),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  radius_m: z.number().int().min(5).max(3000).optional().nullable(),
  allowed_user_ids: z.array(z.string().uuid()).max(100).default([]),
})

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
    const starts = new Date(body.starts_at)
    const ends = new Date(body.ends_at)
    if (ends.getTime() <= starts.getTime()) throw new Error('Invalid QR schedule')
    const durationMs = ends.getTime() - starts.getTime()
    if (durationMs < 60 * 60 * 1000 || durationMs > 24 * 60 * 60 * 1000) {
      throw new Error('QR duration must be between 1 and 24 hours')
    }
    const { data: qrId, error } = await ctx.supabase.rpc('server_create_qr', {
      p_owner_id: ctx.userClaims!.id,
      p_name: body.name,
      p_target_mode: body.target_mode,
      p_starts_at: body.starts_at,
      p_ends_at: body.ends_at,
      p_late_after_minutes: body.late_after_minutes,
      p_gps_enabled: body.gps_enabled,
      p_lat: body.latitude ?? null,
      p_lon: body.longitude ?? null,
      p_radius_m: body.radius_m ?? null,
      p_allowed_user_ids: body.allowed_user_ids,
    })
    if (error) throw error
    const { data: tokenData, error: tokenError } = await ctx.supabase.rpc('server_rotate_qr_token', {
      p_owner_id: ctx.userClaims!.id,
      p_qr_id: qrId,
      p_ttl: '10 minutes',
    })
    if (tokenError) throw tokenError
    return Response.json({ qr_id: qrId, token: tokenData?.[0]?.token, token_expires_at: tokenData?.[0]?.expires_at })
  } catch (error) {
    const result = publicError(error, "QR tidak dapat dibuat. Coba lagi.");
    return Response.json({ error: result.message }, { status: result.status });
  }
}))