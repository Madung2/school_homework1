import { NextResponse } from "next/server";
import { getGuestbookEntries, addGuestbookEntry, turso } from "@/lib/turso";

const AUTHOR_MAX = 50;
const CONTENT_MAX = 500;

export async function GET() {
  if (!turso) {
    return NextResponse.json(
      { error: "방명록을 사용할 수 없습니다. 데이터베이스가 설정되지 않았습니다." },
      { status: 503 }
    );
  }
  try {
    const entries = await getGuestbookEntries();
    return NextResponse.json(entries);
  } catch (e) {
    const message = e instanceof Error ? e.message : "목록을 불러올 수 없습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!turso) {
    return NextResponse.json(
      { error: "방명록을 사용할 수 없습니다. 데이터베이스가 설정되지 않았습니다." },
      { status: 503 }
    );
  }
  let body: { author?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const author = typeof body.author === "string" ? body.author.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!author) {
    return NextResponse.json({ error: "닉네임을 입력해 주세요." }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ error: "댓글 내용을 입력해 주세요." }, { status: 400 });
  }
  if (author.length > AUTHOR_MAX) {
    return NextResponse.json(
      { error: `닉네임은 ${AUTHOR_MAX}자 이내로 입력해 주세요.` },
      { status: 400 }
    );
  }
  if (content.length > CONTENT_MAX) {
    return NextResponse.json(
      { error: `댓글은 ${CONTENT_MAX}자 이내로 입력해 주세요.` },
      { status: 400 }
    );
  }
  try {
    const result = await addGuestbookEntry(author, content);
    if (!result) {
      return NextResponse.json({ error: "저장에 실패했습니다." }, { status: 500 });
    }
    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "저장에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
