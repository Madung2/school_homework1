import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import GuestbookClient from "./GuestbookClient";

export default async function GuestbookPage() {
  const session = await getServerSession(authOptions);
  const authorEmail = session?.user?.email ?? null;
  return <GuestbookClient authorEmail={authorEmail} />;
}
