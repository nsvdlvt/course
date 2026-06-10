import { supabase } from "@/lib/supabase";
import LessonEditor from "@/components/admin/LessonEditor";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LessonPage({
  params,
}: PageProps) {
  const { id } = await params;

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (!lesson) {
    return (
      <div className="p-10">
        Không tìm thấy bài học
      </div>
    );
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .order("title");

  const { data: folders } = await supabase
    .from("folders")
    .select("*");

  const { data: linkedDocuments } =
    await supabase
      .from("lesson_documents")
      .select("*")
      .eq("lesson_id", lesson.id);

  return (
    <LessonEditor
      lesson={lesson}
      documents={documents || []}
      folders={folders || []}
      linkedDocuments={linkedDocuments || []}
    />
  );
}