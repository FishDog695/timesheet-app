import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMINISTRATOR", "FOREMAN", "EMPLOYEE", "ACCOUNTING"]),
  hourlyRate: z.number().min(0).default(0),
  driveRate: z.number().min(0).default(0),
  perDiemRate: z.number().min(0).default(0),
});

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = session.user;
  if (role !== "ADMINISTRATOR" && role !== "ACCOUNTING" && role !== "FOREMAN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { isActive: true },
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
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMINISTRATOR" && session.user.role !== "ACCOUNTING") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password, role, hourlyRate, driveRate, perDiemRate } =
    parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      hourlyRate,
      driveRate,
      perDiemRate,
    },
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

  return NextResponse.json(user, { status: 201 });
}
