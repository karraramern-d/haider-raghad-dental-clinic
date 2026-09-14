const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://mclfhammgfrmuvrtvbcc.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_GCR7RFeOj8dQTTMIuuorjw_2LRneRFm";

export async function supabaseRpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof data?.message === "string" ? data.message : "تعذر الاتصال بقاعدة البيانات");
  return data as T;
}
