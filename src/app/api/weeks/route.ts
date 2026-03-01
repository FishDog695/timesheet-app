import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weeks = await prisma.week.findMany({
    orderBy: { id: "desc" },
    take: 52,
  });

  return NextResponse.json(weeks);
}
