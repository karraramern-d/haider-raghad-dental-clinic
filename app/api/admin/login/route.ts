import { NextResponse } from "next/server";
import { supabaseRpc } from "@/app/lib/supabase-rest";
import { ADMIN_COOKIE } from "@/app/lib/admin-session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  try {
    const result = await supabaseRpc<Array<{ session_token: string; expires_at: string }>>("admin_login", {
      p_pin: typeof body.pin === "string" ? body.pin : "",
      p_ip_hash: request.headers.get("x-forwarded-for") ?? "website",
    });
    const session = result?.[0];
    if (!session?.session_token || session.session_token === "INVALID_PIN" || session.session_token === "RATE_LIMITED") {
      return NextResponse.json({ error: session?.session_token === "RATE_LIMITED" ? "محاولات كثيرة، حاول لاحقًا" : "رمز الدخول غير صحيح" }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, session.session_token, { httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite:"lax", expires:new Date(session.expires_at), path:"/" });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر تسجيل الدخول" }, { status: 500 });
  }
}
