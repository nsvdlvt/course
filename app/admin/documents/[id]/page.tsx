import { supabase } from "@/lib/supabase";

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

  if (!document) {
    return <div>Không tìm thấy</div>;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-black mb-8">
        {document.title}
      </h1>

      <div className="bg-white p-8 rounded-3xl shadow">
        <a
          href={document.file_url}
          target="_blank"
          className="text-blue-600"
        >
          Mở tài liệu
        </a>
      </div>
    </div>
  );
}