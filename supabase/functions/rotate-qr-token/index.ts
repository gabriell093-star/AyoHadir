import { withSupabase } from 'npm:@supabase/server'
import { z } from 'npm:zod'

const bodySchema = z.object({ qr_id: z.string().uuid(), ttl_minutes: z.number().int().min(1).max(15).default(10) })

Deno.serve(withSupabase({ auth: 'user' }, async (req, ctx) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  try {
    const body = bodySchema.parse(await req.json())
    const { data, error } = await ctx.supabase.rpc('server_rotate_qr_token', {
      p_owner_id: ctx.userClaims!.sub,
      p_qr_id: body.qr_id,
      p_ttl: `${body.ttl_minutes} minutes`,
    })
    if (error) throw error
    return Response.json({ token: data?.[0]?.token, token_expires_at: data?.[0]?.expires_at })
  } catch (error) {
    const message = error instanceof z.ZodError ? 'Invalid request data' : (error instanceof Error ? error.message : 'Token rotation failed')
    const status = message === 'Rate limit exceeded, try again later' ? 429 : 400
    return Response.json({ error: message }, { status })
  }
}))