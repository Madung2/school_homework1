-- Turso에서 실행할 스키마 (대시보드 또는 CLI)
CREATE TABLE IF NOT EXISTS allowed_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 시드: kts123@kookmin.ac.kr 추가는 scripts/seed-allowed-members.ts 또는 아래로 수동 실행
-- INSERT INTO allowed_members (email) VALUES ('kts123@kookmin.ac.kr');
