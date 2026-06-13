import { notFound } from "next/navigation";

import ExamForm from "@/components/admin/ExamForm";
import { supabase } from "@/lib/supabase";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditExamPage({ params }: PageProps) {
  const { id } = await params;

  const [{ data: exam }, { data: documents }, { data: lessons }] =
    await Promise.all([
      supabase.from("exams").select("*").eq("id", id).single(),
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

  if (!exam) {
    notFound();
  }

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
        <h1 className="text-4xl font-black">Sửa đề thi</h1>
        <p className="mt-2 text-slate-500">{exam.title}</p>
      </div>

      <ExamForm
        documents={documents || []}
        lessons={lessonOptions}
        exam={exam}
      />
    </div>
  );
}
