import { withSupabase } from 'npm:@supabase/server'
import { z } from 'npm:zod'

const bodySchema = z.object({
  qr_id: z.string().uuid(),
  token: z.string().min(20).max(512),
  client_event_id: z.string().uuid().optional().nullable(),
  scanned_at: z.string().datetime({ offset: true }),
  sync_status: z.enum(['online', 'pending']).default('online'),
  device_id_hash: z.string().min(32).max(256).optional().nullable(),
  device_name: z.string().trim().min(1).max(120).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  accuracy_meters: z.number().nonnegative().optional().nullable(),
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
    const { data, error } = await ctx.supabase.rpc('server_record_attendance', {
      p_user_id: ctx.userClaims!.id,
      p_qr_id: body.qr_id,
      p_token: body.token,
      p_client_event_id: body.client_event_id ?? null,
      p_scanned_at: body.scanned_at,
      p_sync_status: body.sync_status,
      p_device_id_hash: body.device_id_hash ?? null,
      p_device_name: body.device_name ?? null,
      p_lat: body.latitude ?? null,
      p_lon: body.longitude ?? null,
      p_accuracy_meters: body.accuracy_meters ?? null,
    })
    if (error) throw error
    const attendance = data?.[0] ?? null
    return Response.json({ attendance, ...(attendance ?? {}) })
  } catch (error) {
    const result = publicError(error, "Absensi tidak dapat diproses. Coba lagi.");
    return Response.json({ error: result.message }, { status: result.status });
  }
}))