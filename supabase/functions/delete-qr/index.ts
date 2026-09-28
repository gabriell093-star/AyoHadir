import { withSupabase } from 'npm:@supabase/server'
import { z } from 'npm:zod'

const bodySchema = z.object({ qr_id: z.string().uuid() })

Deno.serve(withSupabase({ auth: 'user' }, async (req, ctx) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  try {
    const body = bodySchema.parse(await req.json())
    const { error } = await ctx.supabase.rpc('server_delete_qr', {
      p_owner_id: ctx.userClaims!.id,
      p_qr_id: body.qr_id,
    })
    if (error) throw error
    return Response.json({ ok: true })
  } catch (error) {
    const message = error instanceof z.ZodError ? 'Invalid request data' : (error instanceof Error ? error.message : 'Delete failed')
    const status = message === 'Rate limit exceeded, try again later' ? 429 : 400
    return Response.json({ error: message }, { status })
  }
}))