import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isValidWeekId } from "@/lib/date-utils";
import { canCloseWeek } from "@/lib/permissions";

const patchWeekSchema = z.object({
  isClosed: z.boolean(),
});

export async function GET(
  _request: Request,
  { params }: { params: { weekId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekId } = params;
  if (!isValidWeekId(weekId)) {
    return NextResponse.json({ error: "Invalid weekId" }, { status: 400 });
  }

  const week = await prisma.week.findUnique({ where: { id: weekId } });

  // Return a default open week if it doesn't exist yet
  if (!week) {
    return NextResponse.json({ id: weekId, isClosed: false, closedAt: null });
  }

  return NextResponse.json(week);
}

export async function PATCH(
  request: Request,
  { params }: { params: { weekId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canCloseWeek(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { weekId } = params;
  if (!isValidWeekId(weekId)) {
    return NextResponse.json({ error: "Invalid weekId" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = patchWeekSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { isClosed } = parsed.data;

  const week = await prisma.week.upsert({
    where: { id: weekId },
    create: {
      id: weekId,
      isClosed,
      closedAt: isClosed ? new Date() : null,
      closedById: isClosed ? session.user.id : null,
    },
    update: {
      isClosed,
      closedAt: isClosed ? new Date() : null,
      closedById: isClosed ? session.user.id : null,
    },
  });

  return NextResponse.json(week);
}
