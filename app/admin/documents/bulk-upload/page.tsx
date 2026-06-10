import { supabase } from "@/lib/supabase";
import BulkDocumentUploader from "@/components/admin/BulkDocumentUploader";

export default async function BulkUploadPage() {
  const { data: folders } =
    await supabase
      .from("folders")
      .select("*")
      .order("name");

  return (
    <div className="max-w-6xl">
      <h1 className="text-4xl font-black mb-2">
        Upload hàng loạt
      </h1>

      <p className="text-slate-500 mb-8">
        Upload nhiều tài liệu cùng lúc
      </p>

      <BulkDocumentUploader
        folders={folders || []}
      />
    </div>
  );
}