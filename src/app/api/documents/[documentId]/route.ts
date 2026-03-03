import { NextResponse } from "next/server";
import { readFile, unlink } from "fs/promises";
import { join } from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageDocuments } from "@/lib/permissions";
import type { Role } from "@/types";

const UPLOAD_DIR = join(process.cwd(), "uploads", "documents");

export async function GET(
  _request: Request,
  { params }: { params: { documentId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const document = await prisma.document.findUnique({
    where: { id: params.documentId },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = join(UPLOAD_DIR, document.fileName);
  let fileBuffer: Buffer;

  try {
    fileBuffer = await readFile(filePath);
  } catch {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `attachment; filename="${document.originalName}"`,
      "Content-Length": String(document.fileSize),
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { documentId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageDocuments(session.user.role as Role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const document = await prisma.document.findUnique({
    where: { id: params.documentId },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.document.delete({ where: { id: params.documentId } });

  const filePath = join(UPLOAD_DIR, document.fileName);
  try {
    await unlink(filePath);
  } catch {
    // File may already be gone — ignore error
  }

  return new NextResponse(null, { status: 204 });
}
