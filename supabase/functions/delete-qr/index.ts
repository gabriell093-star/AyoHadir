import { withSupabase } from 'npm:@supabase/server'
import { z } from 'npm:zod'

const bodySchema = z.object({ qr_id: z.string().uuid() })

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
  const raw = error instanceof z.ZodError
    ? "Invalid request data"
    : error instanceof Error
      ? error.message
      : "";
  const safe = [
    "Authentication required",
    "Email verification required",
    "Invalid request data",
    "Invalid QR schedule",
    "QR duration must be between 1 and 24 hours",
    "QR session not found",
    "QR session is not active",
    "QR session is already expired",
    "Only active QR sessions can be edited",
    "Only the QR owner can edit it",
    "Only the QR owner can delete it",
    "Only the QR owner can review this request",
    "Only the QR owner can cancel this attendance",
    "Attendance record not found",
    "Cancellation request not found",
    "Attendance already recorded for this QR session",
    "Invalid or expired QR token",
    "QR token was not valid when the offline scan occurred",
    "User is not allowed for this QR session",
    "GPS location is required for this QR session",
    "GPS location is outside the allowed radius",
    "Invalid GPS coordinates",
    "Invalid scan time",
    "Invalid scan time for this QR session",
    "Specific-user QR must target 1 to 100 unique users",
    "One or more target users do not exist",
    "Allowed users must be empty when target_mode is all_users",
    "GPS radius must be 5 to 3000 meters",
    "GPS data must be empty when GPS is disabled",
    "Cancellation reason must be 3 to 1000 characters",
    "Cancellation already reviewed",
    "Invalid cancellation decision",
    "Method not allowed",
    "Rate limit exceeded, try again later"
  ];
  return safe.includes(raw) ? raw : "Request failed";
}
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
    const result = publicError(error, "Sesi QR tidak dapat dihapus. Coba lagi.");
    return Response.json({ error: result.message }, { status: result.status });
  }
}))