import LessonForm from "@/components/admin/LessonForm";
import { supabase } from "@/lib/supabase";

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

  const { data: lastLesson } =
    await supabase
      .from("lessons")
      .select("position")
      .eq("chapter_id", id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

  const nextPosition =
    typeof lastLesson?.position === "number"
      ? lastLesson.position + 1
      : 1;

  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-black mb-8">
        Thêm bài học
      </h1>

      <LessonForm
        chapterId={id}
        documents={documents || []}
        folders={folders || []}
        initialPosition={nextPosition}
      />
    </div>
  );
}
