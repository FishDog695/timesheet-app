import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageDocuments } from "@/lib/permissions";
import type { Role } from "@/types";

const UPLOAD_DIR = join(process.cwd(), "uploads", "documents");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    select: {
      id: true,
      originalName: true,
      fileSize: true,
      uploadedAt: true,
      uploadedBy: { select: { name: true } },
    },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json(documents);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageDocuments(session.user.role as Role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File size must be 10 MB or less" },
      { status: 400 }
    );
  }

  const fileName = `${randomUUID()}.pdf`;
  const filePath = join(UPLOAD_DIR, fileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(filePath, buffer);

  const document = await prisma.document.create({
    data: {
      fileName,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      uploadedById: session.user.id,
    },
    select: {
      id: true,
      originalName: true,
      fileSize: true,
      uploadedAt: true,
      uploadedBy: { select: { name: true } },
    },
  });

  return NextResponse.json(document, { status: 201 });
}
