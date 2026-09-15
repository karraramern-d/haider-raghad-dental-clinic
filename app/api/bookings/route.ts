import { NextResponse } from "next/server";
import { supabaseRpc } from "@/app/lib/supabase-rest";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.fullName || !body?.phone || !body?.date || !body?.time) {
    return NextResponse.json({ error: "أكمل معلومات الحجز المطلوبة" }, { status: 400 });
  }

  try {
    const result = await supabaseRpc<Array<{ appointment_id: string; status: string; request_code: string }>>(
      "submit_booking_atomic",
      {
        p_full_name: String(body.fullName).trim(),
        p_phone: String(body.phone).trim(),
        p_appointment_date: body.date,
        p_start_time: body.time,
        p_patient_type: body.patientType === "returning" ? "returning" : "new",
        p_session_number:
          body.patientType === "returning" && body.sessionNumber ? Number(body.sessionNumber) : null,
        p_purpose: body.purpose || "",
        p_session_label: null,
        p_privacy_accepted: true,
      },
    );

    return NextResponse.json({ booking: result?.[0] || result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر حفظ الحجز" },
      { status: 409 },
    );
  }
}
