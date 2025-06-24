// app/api/create-lobby/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name } = await req.json();

  // Örnek rastgele kod üretimi
  const code = Math.random().toString(36).substring(2, 7).toUpperCase();

  return NextResponse.json({ code });
}
