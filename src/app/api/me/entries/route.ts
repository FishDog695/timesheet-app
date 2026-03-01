import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  isValidWeekId,
  getCurrentWeekId,
  isCurrentWeek,
} from "@/lib/date-utils";

const entrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  regularHours: z.number().min(0).max(24),
  driveHours: z.number().min(0).max(24),
});

const saveSchema = z.object({
  weekId: z.string(),
  entries: z
    .array(entrySchema)
    .refine((entries) =>
      entries.every((e) => e.regularHours + e.driveHours <= 24)
    ),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const weekId = searchParams.get("weekId") ?? getCurrentWeekId();

  if (!isValidWeekId(weekId)) {
    return NextResponse.json({ error: "Invalid weekId" }, { status: 400 });
  }

  const entries = await prisma.timeEntry.findMany({
    where: { weekId, userId: session.user.id },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(entries);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { weekId, entries } = parsed.data;

  if (!isValidWeekId(weekId)) {
    return NextResponse.json({ error: "Invalid weekId" }, { status: 400 });
  }

  // Employees can only edit current week
  if (!isCurrentWeek(weekId)) {
    return NextResponse.json(
      { error: "Employees can only edit the current week" },
      { status: 403 }
    );
  }

  // Check if week is closed
  const week = await prisma.week.findUnique({ where: { id: weekId } });
  if (week?.isClosed) {
    return NextResponse.json(
      { error: "This week is closed and cannot be edited" },
      { status: 403 }
    );
  }

  if (entries.length === 0) {
    return NextResponse.json({ count: 0 });
  }

  // Ensure week row exists
  await prisma.week.upsert({
    where: { id: weekId },
    create: { id: weekId },
    update: {},
  });

  const userId = session.user.id;

  await prisma.$transaction(
    entries.map((e) => {
      const perDiem = e.regularHours + e.driveHours > 0;
      const dateVal = new Date(e.date + "T00:00:00Z");
      return prisma.timeEntry.upsert({
        where: { weekId_userId_date: { weekId, userId, date: dateVal } },
        create: {
          weekId,
          userId,
          date: dateVal,
          regularHours: e.regularHours,
          driveHours: e.driveHours,
          perDiem,
        },
        update: {
          regularHours: e.regularHours,
          driveHours: e.driveHours,
          perDiem,
        },
      });
    })
  );

  return NextResponse.json({ count: entries.length });
}
