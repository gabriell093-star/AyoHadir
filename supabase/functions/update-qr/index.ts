import { withSupabase } from 'npm:@supabase/server'
import { z } from 'npm:zod'

const bodySchema = z.object({
  qr_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  target_mode: z.enum(['all_users','specific_users']),
  starts_at: z.string().datetime({ offset: true }),
  ends_at: z.string().datetime({ offset: true }),
  late_after_minutes: z.number().int().min(0).max(1440),
  gps_enabled: z.boolean(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  radius_m: z.number().int().min(5).max(3000).nullable().optional(),
  allowed_user_ids: z.array(z.string().uuid()).max(100).default([])
})

Deno.serve(withSupabase({ auth: 'user' }, async (req, ctx) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  try {
    const body = bodySchema.parse(await req.json())
    const starts = new Date(body.starts_at)
    const ends = new Date(body.ends_at)
    if (ends <= starts) throw new Error('Invalid QR schedule')
    const durationMs = ends.getTime() - starts.getTime()
    if (durationMs < 60 * 60 * 1000 || durationMs > 24 * 60 * 60 * 1000) {
      throw new Error('QR duration must be between 1 and 24 hours')
    }
    const { error } = await ctx.supabase.rpc('server_update_qr', {
      p_owner_id: ctx.userClaims!.sub,
      p_qr_id: body.qr_id,
      p_name: body.name,
      p_target_mode: body.target_mode,
      p_starts_at: body.starts_at,
      p_ends_at: body.ends_at,
      p_late_after_minutes: body.late_after_minutes,
      p_gps_enabled: body.gps_enabled,
      p_lat: body.latitude ?? null,
      p_lon: body.longitude ?? null,
      p_radius_m: body.gps_enabled ? body.radius_m ?? null : null,
      p_allowed_user_ids: body.target_mode === 'specific_users' ? body.allowed_user_ids : []
    })
    if (error) throw error
    return Response.json({ ok: true, qr_id: body.qr_id })
  } catch (error) {
    const message = error instanceof z.ZodError ? 'Invalid request data' : (error instanceof Error ? error.message : 'Update failed')
    const status = message === 'Rate limit exceeded, try again later' ? 429 : 400
    return Response.json({ error: message }, { status })
  }
}))