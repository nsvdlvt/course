import { supabase } from "@/lib/supabase";
import LessonPlayer from "@/components/LessonPlayer";

interface PageProps {
  params: Promise<{
    slug: string;
    lessonSlug: string;
  }>;
}

type LessonDocument = {
  id: string;
  title: string;
  file_url: string;
  file_name: string | null;
};

type LessonDocumentLink = {
  document_id: string;
  documents: LessonDocument | LessonDocument[] | null;
};

type LessonSection = {
  id: string;
  title: string;
  video_url: string | null;
  position: number;
};

export default async function LessonPage({ params }: PageProps) {
  const { lessonSlug } = await params;

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", lessonSlug)
    .single();

  if (!lesson) {
    return <div className="p-10">Không tìm thấy bài học</div>;
  }

  const { data: lessonDocuments } = await supabase
    .from("lesson_documents")
    .select(
      `
        document_id,
        documents(*)
      `
    )
    .eq("lesson_id", lesson.id);

  const { data: sections } = await supabase
    .from("lesson_sections")
    .select("*")
    .eq("lesson_id", lesson.id)
    .order("position");

  const documents = ((lessonDocuments || []) as LessonDocumentLink[]).flatMap(
    (item) => {
      if (!item.documents) {
        return [];
      }

      return Array.isArray(item.documents) ? item.documents : [item.documents];
    }
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-6 mt-4 text-4xl font-black text-slate-800 md:text-5xl">
        {lesson.title}
      </h1>

      <LessonPlayer
        lesson={lesson}
        sections={(sections || []) as LessonSection[]}
        documents={documents}
      />
    </main>
  );
}
