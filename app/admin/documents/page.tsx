import Link from "next/link";
import { Plus, FileText, UploadCloud } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default async function DocumentsPage() {
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  return (
    <div><div className="flex justify-between mb-8">
  <h1 className="text-4xl font-black">
    Tài liệu
  </h1>

  <div className="flex gap-3">
    <Link
      href="/admin/documents/new"
      className="
        flex
        items-center
        gap-2
        bg-blue-600
        text-white
        px-5
        py-3
        rounded-xl
        hover:bg-blue-700
      "
    >
      <Plus size={18} />
      Upload
    </Link>

    <Link
      href="/admin/documents/bulk-upload"
      className="
        flex
        items-center
        gap-2
        bg-blue-600
        text-white
        px-5
        py-3
        rounded-xl
        hover:bg-blue-700
      "
    >
      <UploadCloud size={18} />
      Upload hàng loạt
    </Link>
  </div>
</div>

      <div className="space-y-4">
        {(documents || []).map((doc) => (
          <Link
            key={doc.id}
            href={`/admin/documents/${doc.id}`}
            className="
              flex
              items-center
              gap-4
              bg-white
              p-5
              rounded-2xl
              shadow
            "
          >
            <FileText />

            <div>
              <p className="font-semibold">
                {doc.title}
              </p>

              <p className="text-sm text-slate-500">
                {doc.file_name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}