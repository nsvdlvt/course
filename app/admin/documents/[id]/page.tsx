import { supabase } from "@/lib/supabase";
import DocumentEditor from "@/components/admin/DocumentEditor";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  const { data: folders } = await supabase
    .from("folders")
    .select("*")
    .order("name");

  if (!document) {
    return <div>Không tìm thấy</div>;
  }

  return (
    <DocumentEditor
      document={document}
      folders={folders || []}
    />
  );
}
