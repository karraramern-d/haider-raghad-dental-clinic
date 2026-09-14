import { NextResponse } from "next/server";
import { getAdminToken, ADMIN_COOKIE } from "@/app/lib/admin-session";
import { supabaseRpc } from "@/app/lib/supabase-rest";

export async function POST() {
  const token = await getAdminToken();
  if (token) await supabaseRpc("admin_logout", { p_session_token: token }).catch(() => undefined);
  const response = NextResponse.json({ ok:true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
