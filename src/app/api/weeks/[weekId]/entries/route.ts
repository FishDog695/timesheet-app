import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isValidWeekId } from "@/lib/date-utils";
import { canEditEntries, canViewAllEntries } from "@/lib/permissions";

const entrySchema = z.object({
  userId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  regularHours: z.number().min(0).max(24),
  driveHours: z.number().min(0).max(24),
});

const bulkUpsertSchema = z.object({
  entries: z
    .array(entrySchema)
    .refine((entries) =>
      entries.every((e) => e.regularHours + e.driveHours <= 24)
    ),
});

export async function GET(
  _request: Request,
  { params }: { params: { weekId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canViewAllEntries(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { weekId } = params;
  if (!isValidWeekId(weekId)) {
    return NextResponse.json({ error: "Invalid weekId" }, { status: 400 });
  }

  const entries = await prisma.timeEntry.findMany({
    where: { weekId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ userId: "asc" }, { date: "asc" }],
  });

  return NextResponse.json(entries);
}

export async function PUT(
  request: Request,
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

  const body = await request.json();
  const parsed = bulkUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Get or determine week status
  const week = await prisma.week.findUnique({ where: { id: weekId } });
  const weekIsClosed = week?.isClosed ?? false;

  // Check permission for first entry's userId (all entries in a bulk save
  // should be from the same context check)
  const { entries } = parsed.data;

  for (const entry of entries) {
    const allowed = canEditEntries({
      role: session.user.role,
      userId: session.user.id,
      targetUserId: entry.userId,
      weekIsClosed,
      weekId,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: `Forbidden: cannot edit entry for user ${entry.userId}` },
        { status: 403 }
      );
    }
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

  // Bulk upsert via transaction
  await prisma.$transaction(
    entries.map((e) => {
      const perDiem = e.regularHours + e.driveHours > 0;
      const dateVal = new Date(e.date + "T00:00:00Z");
      return prisma.timeEntry.upsert({
        where: { weekId_userId_date: { weekId, userId: e.userId, date: dateVal } },
        create: {
          weekId,
          userId: e.userId,
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
