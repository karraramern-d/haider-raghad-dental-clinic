import { NextResponse } from "next/server";
import { getAdminToken } from "@/app/lib/admin-session";
import { supabaseRpc } from "@/app/lib/supabase-rest";

export async function GET(request: Request) {
  const token = await getAdminToken();
  if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  try {
    return NextResponse.json(await supabaseRpc("admin_accounting_summary", {
      p_session_token: token, p_from: params.get("from") || null, p_to: params.get("to") || null,
    }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر تحميل الحسابات" }, { status: 401 });
  }
}
