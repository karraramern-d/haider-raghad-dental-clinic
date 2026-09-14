import { NextResponse } from "next/server";
import { getAdminToken } from "@/app/lib/admin-session";
import { supabaseRpc } from "@/app/lib/supabase-rest";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const token = await getAdminToken();
  if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await context.params;
  try {
    return NextResponse.json(await supabaseRpc("admin_patient_records", { p_session_token: token, p_patient_id: id }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر تحميل ملف المراجع" }, { status: 409 });
  }
}
