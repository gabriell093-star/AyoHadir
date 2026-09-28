import { withSupabase } from 'npm:@supabase/server'
import { z } from 'npm:zod'

const bodySchema = z.object({
  request_id: z.string().uuid(),
  decision: z.enum(['approved', 'rejected']),
  reviewer_reason: z.string().trim().max(1000).optional().nullable(),
})

Deno.serve(withSupabase({ auth: 'user' }, async (req, ctx) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  try {
    const body = bodySchema.parse(await req.json())
    if (body.decision === 'rejected' && (!body.reviewer_reason || body.reviewer_reason.length < 3)) {
      return Response.json({ error: 'Rejection reason is required' }, { status: 400 })
    }
    const { error } = await ctx.supabase.rpc('server_review_cancellation', {
      p_reviewer_id: ctx.userClaims!.id,
      p_request_id: body.request_id,
      p_decision: body.decision,
      p_reviewer_reason: body.reviewer_reason ?? null,
    })
    if (error) throw error
    return Response.json({ ok: true })
  } catch (error) {
    const message = error instanceof z.ZodError ? 'Invalid request data' : (error instanceof Error ? error.message : 'Review failed')
    const status = message === 'Rate limit exceeded, try again later' ? 429 : 400
    return Response.json({ error: message }, { status })
  }
}))