import ExamForm from "@/components/admin/ExamForm";
import { supabase } from "@/lib/supabase";

export default async function NewExamPage() {
  const [{ data: documents }, { data: lessons }] = await Promise.all([
    supabase
      .from("documents")
      .select("id,title,file_url,file_name,file_type")
      .or("file_type.eq.application/pdf,file_name.ilike.%.pdf")
      .order("title"),
    supabase
      .from("lessons")
      .select(
        `
          id,
          title,
          chapters (
            title,
            courses (
              title
            )
          )
        `
      )
      .order("title"),
  ]);

  const lessonOptions = (lessons || []).map((lesson) => {
    const chapter = Array.isArray(lesson.chapters)
      ? lesson.chapters[0]
      : lesson.chapters;
    const course = Array.isArray(chapter?.courses)
      ? chapter?.courses[0]
      : chapter?.courses;

    return {
      id: lesson.id,
      title: lesson.title,
      chapters: chapter
        ? {
            title: chapter.title,
            courses: course ? { title: course.title } : null,
          }
        : null,
    };
  });

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-black">Thêm đề thi</h1>
        <p className="mt-2 text-slate-500">
          Tạo đề thi tự do hoặc đề thi gắn với một bài học.
        </p>
      </div>

      <ExamForm documents={documents || []} lessons={lessonOptions} />
    </div>
  );
}
