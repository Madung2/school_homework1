import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";

// Next.js는 .env.local을 쓰므로, 스크립트 실행 시에도 .env.local 로드
config({ path: resolve(process.cwd(), ".env.local"), override: true });
config({ path: resolve(process.cwd(), ".env"), override: false });

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
    const code = e && typeof e === "object" && "code" in e ? (e as { code: string }).code : "";
    if (code === "SQLITE_CONSTRAINT" || code === "SQLITE_CONSTRAINT_UNIQUE") {
      console.log("kts123@kookmin.ac.kr 는 이미 등록되어 있음");
    } else throw e;
  }
}

seed().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
