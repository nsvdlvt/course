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

  const { data: exams } = await supabase
    .from("exams")
    .select("id,title,lesson_section_id")
    .order("title");

  const { data: linkedDocuments } =
    await supabase
      .from("lesson_documents")
      .select("*")
      .eq("lesson_id", lesson.id);

  const { data: sections } = await supabase
    .from("lesson_sections")
    .select("*")
    .eq("lesson_id", lesson.id)
    .order("position");

  const sectionsWithExam = (sections || []).map((section) => {
    const linkedExam = (exams || []).find((exam) => exam.lesson_section_id === section.id);
    return {
      ...section,
      exam_id: linkedExam?.id || null,
    };
  });

  return (
    <LessonEditor
      lesson={lesson}
      documents={documents || []}
      folders={folders || []}
      linkedDocuments={linkedDocuments || []}
      sections={sectionsWithExam}
      exams={exams || []}
    />
  );
}
