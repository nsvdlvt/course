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

  const [{ data: documents }, { data: folders }, { data: lastLesson }, { data: exams }] = await Promise.all([
    supabase.from("documents").select("*").order("title"),
    supabase.from("folders").select("*").order("name"),
    supabase
      .from("lessons")
      .select("position")
      .eq("chapter_id", id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("exams").select("id,title").order("title"),
  ]);

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
        exams={exams || []}
        initialPosition={nextPosition}
      />
    </div>
  );
}
