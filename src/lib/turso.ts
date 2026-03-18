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

export type GuestbookEntry = {
  id: number;
  author: string;
  content: string;
  created_at: string;
};

export async function getGuestbookEntries(): Promise<GuestbookEntry[]> {
  if (!turso) return [];
  const r = await turso.execute({
    sql: "SELECT id, author, content, created_at FROM guestbook ORDER BY created_at DESC",
    args: [],
  });
  return r.rows.map((row) => ({
    id: Number(row.id),
    author: String(row.author),
    content: String(row.content),
    created_at: String(row.created_at),
  }));
}

export async function addGuestbookEntry(author: string, content: string): Promise<{ id: number } | null> {
  if (!turso) return null;
  const r = await turso.execute({
    sql: "INSERT INTO guestbook (author, content) VALUES (?, ?) RETURNING id",
    args: [author, content],
  });
  const row = r.rows[0];
  if (!row || row.id == null) return null;
  return { id: Number(row.id) };
}
