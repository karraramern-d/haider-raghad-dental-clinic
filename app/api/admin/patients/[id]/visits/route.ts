import { NextResponse } from "next/server";
import { getAdminToken } from "@/app/lib/admin-session";
import { supabaseRpc } from "@/app/lib/supabase-rest";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = await getAdminToken();
  if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json();
  try {
    return NextResponse.json(await supabaseRpc("admin_add_patient_visit", {
      p_session_token: token, p_patient_id: id, p_visit_date: body.visitDate || null,
      p_treatment: body.treatment || "", p_notes: body.notes || "",
      p_status: body.status === "PAID" ? "PAID" : "UNPAID",
      p_amount_iqd: Math.max(0, Number(body.amountIqd || 0)), p_appointment_id: body.appointmentId || null,
    }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر إضافة الجلسة" }, { status: 409 });
  }
}
