import { NextResponse } from "next/server";
import { getAdminToken } from "@/app/lib/admin-session";
import { supabaseRpc } from "@/app/lib/supabase-rest";

export async function POST(request: Request) {
  const token = await getAdminToken();
  if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body?.appointmentId || !body?.action) {
    return NextResponse.json({ error: "بيانات الحجز ناقصة" }, { status: 400 });
  }
  try {
    const result = await supabaseRpc("admin_appointment_action", {
      p_session_token: token,
      p_appointment_id: body.appointmentId,
      p_action: body.action,
      p_date: body.date || null,
      p_start: body.startTime || null,
      p_override: false,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر تحديث الحجز" },
      { status: 409 },
    );
  }
}
