import { supabase } from "@/lib/supabase";
import LessonForm from "@/components/admin/LessonForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewLessonPage({
  params,
}: PageProps) {
  const { id } = await params;

  const { data: documents } =
    await supabase
      .from("documents")
      .select("*")
      .order("title");

  const { data: folders } =
    await supabase
      .from("folders")
      .select("*")
      .order("name");

  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-black mb-8">
        Thêm bài học
      </h1>

      <LessonForm
        chapterId={id}
        documents={documents || []}
        folders={folders || []}
      />
    </div>
  );
}