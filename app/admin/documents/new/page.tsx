import { supabase } from "@/lib/supabase";
import DocumentUploader from "@/components/admin/DocumentUploader";

export default async function NewDocumentPage() {
  const { data: folders } =
    await supabase
      .from("folders")
      .select("*")
      .order("name");

  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-black mb-8">
        Upload tài liệu
      </h1>

      <DocumentUploader
        folders={folders || []}
      />
    </div>
  );
}