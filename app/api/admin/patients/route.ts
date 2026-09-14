import { NextResponse } from "next/server";
import { getAdminToken } from "@/app/lib/admin-session";
import { supabaseRpc } from "@/app/lib/supabase-rest";

export async function GET(request: Request) {
  const token = await getAdminToken();
  if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  try {
    const query = new URL(request.url).searchParams.get("query") || null;
    return NextResponse.json(await supabaseRpc("admin_patients_list", { p_session_token: token, p_query: query }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر تحميل المراجعين" }, { status: 401 });
  }
}
