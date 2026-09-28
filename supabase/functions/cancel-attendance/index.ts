import { withSupabase } from 'npm:@supabase/server'
import { z } from 'npm:zod'

const bodySchema = z.object({
  attendance_id: z.string().uuid(),
  reason: z.string().trim().min(3).max(1000)
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


function safeErrorMessage(error: unknown) {
  const raw = error instanceof z.ZodError ? "Invalid request data" : error instanceof Error ? error.message : "";
  const safe = ["Authentication required","Only the QR owner can cancel this attendance","Attendance record not found","Attendance already cancelled","Cancellation reason must be 3 to 1000 characters","Invalid request data","Method not allowed","Rate limit exceeded, try again later"];
  return safe.includes(raw) ? raw : "Request failed";
}
Deno.serve(withSupabase({ auth: 'user' }, async (req, ctx) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  try {
    const body = bodySchema.parse(await req.json())
    const { error } = await ctx.supabase.rpc('server_cancel_attendance_by_owner', {
      p_owner_id: ctx.userClaims!.id,
      p_attendance_id: body.attendance_id,
      p_reason: body.reason
    })
    if (error) throw error
    return Response.json({ ok: true, attendance_id: body.attendance_id })
  } catch (error) {
    const result = publicError(error, "Absensi tidak dapat dibatalkan. Coba lagi.");
    return Response.json({ error: result.message }, { status: result.status });
  }
}))