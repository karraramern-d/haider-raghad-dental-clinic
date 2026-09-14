import { NextResponse } from "next/server";
import { getAdminToken } from "@/app/lib/admin-session";
import { supabaseRpc } from "@/app/lib/supabase-rest";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = await getAdminToken();
  if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json();
  try {
    return NextResponse.json(await supabaseRpc("admin_save_patient_profile", {
      p_session_token: token, p_patient_id: id, p_age: body.age ? Number(body.age) : null,
      p_medical_condition: body.medicalCondition || "", p_doctor_notes: body.doctorNotes || "",
      p_prescribed_treatment: body.prescribedTreatment || "",
    }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر حفظ الملف" }, { status: 409 });
  }
}
