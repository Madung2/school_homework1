import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL ?? "";
const authToken = process.env.TURSO_AUTH_TOKEN ?? "";

export const turso =
  url && authToken
    ? createClient({ url, authToken })
    : null;

export async function isAllowedEmail(email: string | null | undefined): Promise<boolean> {
  if (!email || !turso) return false;
  const r = await turso.execute({
    sql: "SELECT 1 FROM allowed_members WHERE email = ? LIMIT 1",
    args: [email],
  });
  return r.rows.length > 0;
}
