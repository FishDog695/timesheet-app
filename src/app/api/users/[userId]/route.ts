import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const adminPatchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z
    .enum(["ADMINISTRATOR", "FOREMAN", "EMPLOYEE", "ACCOUNTING"])
    .optional(),
  isActive: z.boolean().optional(),
  hourlyRate: z.number().min(0).optional(),
  driveRate: z.number().min(0).optional(),
  perDiemRate: z.number().min(0).optional(),
});

const selfPatchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = params;
  const isSelf = session.user.id === userId;
  const isAdmin = session.user.role === "ADMINISTRATOR" || session.user.role === "ACCOUNTING";

  if (!isSelf && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      hourlyRate: true,
      driveRate: true,
      perDiemRate: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = params;
  const { role: callerRole, id: callerId } = session.user;
  const isSelf = callerId === userId;

  const body = await request.json();

  let updateData: Record<string, unknown> = {};

  if (callerRole === "ADMINISTRATOR" || callerRole === "ACCOUNTING") {
    const parsed = adminPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { password, ...rest } = parsed.data;
    updateData = { ...rest };
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }
  } else if (isSelf) {
    const parsed = selfPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    updateData = parsed.data;
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      hourlyRate: true,
      driveRate: true,
      perDiemRate: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMINISTRATOR" && session.user.role !== "ACCOUNTING") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = params;

  // Prevent self-deletion
  if (session.user.id === userId) {
    return NextResponse.json(
      { error: "Cannot deactivate your own account" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: { id: true, isActive: true },
  });

  return NextResponse.json(user);
}
