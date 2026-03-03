import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canManageDocuments } from "@/lib/permissions";
import type { Role } from "@/types";
import { DocumentsClient } from "./DocumentsClient";

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

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

  const serialized = documents.map((doc) => ({
    ...doc,
    uploadedAt: doc.uploadedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Documents</h1>
        <p className="text-sm text-gray-600">
          Company documents available for download
        </p>
      </div>
      <DocumentsClient
        initialDocuments={serialized}
        canManage={canManageDocuments(session.user.role as Role)}
      />
    </div>
  );
}
