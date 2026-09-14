import { cookies } from "next/headers";

export const ADMIN_COOKIE = "haider_admin_session";

export async function getAdminToken() {
  return (await cookies()).get(ADMIN_COOKIE)?.value ?? "";
}
