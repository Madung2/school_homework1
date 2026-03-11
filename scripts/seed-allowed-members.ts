import "dotenv/config";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("TURSO_DATABASE_URL, TURSO_AUTH_TOKEN 필요");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function seed() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS allowed_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  try {
    await client.execute({
      sql: "INSERT INTO allowed_members (email) VALUES (?)",
      args: ["kts123@kookmin.ac.kr"],
    });
    console.log("kts123@kookmin.ac.kr 허용 리스트에 추가됨");
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      console.log("kts123@kookmin.ac.kr 는 이미 등록되어 있음");
    } else throw e;
  }
}

seed().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
