import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, code } = await req.json();
  return NextResponse.json({ success: true }); // geçici
}
