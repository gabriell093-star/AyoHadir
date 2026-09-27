import { withSupabase } from 'npm:@supabase/server'
import { z } from 'npm:zod'

const bodySchema = z.object({
  attendance_id: z.string().uuid(),
  reason: z.string().trim().min(3).max(1000)
})

Deno.serve(withSupabase({ auth: 'user' }, async (req, ctx) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  try {
    const body = bodySchema.parse(await req.json())
    const { error } = await ctx.supabase.rpc('server_cancel_attendance_by_owner', {
      p_owner_id: ctx.userClaims!.sub,
      p_attendance_id: body.attendance_id,
      p_reason: body.reason
    })
    if (error) throw error
    return Response.json({ ok: true, attendance_id: body.attendance_id })
  } catch (error) {
    const message = error instanceof z.ZodError ? 'Invalid request data' : (error instanceof Error ? error.message : 'Cancellation failed')
    const status = message === 'Rate limit exceeded, try again later' ? 429 : 400
    return Response.json({ error: message }, { status })
  }
}))