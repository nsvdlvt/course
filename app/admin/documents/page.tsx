import Link from "next/link";
import {
  Edit3,
  FileText,
  Plus,
  UploadCloud,
} from "lucide-react";

import DocumentDeleteButton from "@/components/admin/DocumentDeleteButton";
import { supabase } from "@/lib/supabase";

export default async function DocumentsPage() {
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-black">
          Tai lieu
        </h1>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/documents/new"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Upload
          </Link>

          <Link
            href="/admin/documents/bulk-upload"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            <UploadCloud size={18} />
            Upload hang loat
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {(documents || []).map((doc) => (
          <div
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow"
          >
            <Link
              href={`/admin/documents/${doc.id}`}
              className="flex min-w-0 flex-1 items-center gap-4"
            >
              <FileText className="shrink-0 text-blue-600" />

              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {doc.title}
                </p>

                <p className="truncate text-sm text-slate-500">
                  {doc.file_name}
                </p>
              </div>
            </Link>

            <div className="flex shrink-0 gap-2">
              <Link
                href={`/admin/documents/${doc.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-700 hover:bg-slate-200"
              >
                <Edit3 size={16} />
                Sua
              </Link>

              <DocumentDeleteButton
                documentId={doc.id}
                fileUrl={doc.file_url}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
