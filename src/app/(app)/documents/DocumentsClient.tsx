"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";

interface Document {
  id: string;
  originalName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: { name: string };
}

interface DocumentsClientProps {
  initialDocuments: Document[];
  canManage: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsClient({
  initialDocuments,
  canManage,
}: DocumentsClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startUpload] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    startUpload(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setUploadError(data.error ?? "Upload failed");
      } else {
        router.refresh();
      }

      // Reset input so the same file can be re-uploaded if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Delete "${doc.originalName}"? This cannot be undone.`)) return;
    setDeleteError(null);
    setDeletingId(doc.id);

    const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });

    setDeletingId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error ?? "Delete failed");
    } else {
      router.refresh();
    }
  };

  const filteredDocuments = initialDocuments.filter((doc) =>
    doc.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        {canManage && (
          <>
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              loading={isUploading}
            >
              Upload Document
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleUpload}
            />
            {uploadError && (
              <span className="text-sm text-red-600">{uploadError}</span>
            )}
          </>
        )}
        {initialDocuments.length > 0 && (
          <input
            type="search"
            placeholder="Search documents…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
          />
        )}
      </div>

      {deleteError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {deleteError}
        </p>
      )}

      {initialDocuments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm">No documents match your search.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  File
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">
                  Size
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden md:table-cell">
                  Uploaded by
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden md:table-cell">
                  Date
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {doc.originalName}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                    {formatBytes(doc.fileSize)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {doc.uploadedBy.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/api/documents/${doc.id}`}
                        download={doc.originalName}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Download
                      </a>
                      {canManage && (
                        <button
                          onClick={() => handleDelete(doc)}
                          disabled={deletingId === doc.id}
                          className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50"
                        >
                          {deletingId === doc.id ? "Deleting…" : "Delete"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
