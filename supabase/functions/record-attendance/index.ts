import { withSupabase } from 'npm:@supabase/server'
import { z } from 'npm:zod'

const bodySchema = z.object({
  qr_id: z.string().uuid(),
  token: z.string().min(20).max(512),
  client_event_id: z.string().uuid().optional().nullable(),
  scanned_at: z.string().datetime({ offset: true }),
  sync_status: z.enum(['online', 'pending']).default('online'),
  device_id_hash: z.string().min(32).max(256).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  accuracy_meters: z.number().nonnegative().optional().nullable(),
})

Deno.serve(withSupabase({ auth: 'user' }, async (req, ctx) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  try {
    const body = bodySchema.parse(await req.json())
    const { data, error } = await ctx.supabase.rpc('server_record_attendance', {
      p_user_id: ctx.userClaims!.sub,
      p_qr_id: body.qr_id,
      p_token: body.token,
      p_client_event_id: body.client_event_id ?? null,
      p_scanned_at: body.scanned_at,
      p_sync_status: body.sync_status,
      p_device_id_hash: body.device_id_hash ?? null,
      p_lat: body.latitude ?? null,
      p_lon: body.longitude ?? null,
      p_accuracy_meters: body.accuracy_meters ?? null,
    })
    if (error) throw error
    return Response.json({ attendance: data?.[0] ?? null })
  } catch (error) {
    const message = error instanceof z.ZodError ? 'Invalid request data' : (error instanceof Error ? error.message : 'Attendance failed')
    const status = message === 'Rate limit exceeded, try again later' ? 429 : 400
    return Response.json({ error: message }, { status })
  }
}))