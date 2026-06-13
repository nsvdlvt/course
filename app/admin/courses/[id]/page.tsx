import Link from "next/link";
import { BookOpen, ChevronRight, Layers3, Plus, PlayCircle } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { sortLessonsByDisplayOrder } from "@/lib/lesson-sort";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data: course } = await supabase.from("courses").select("*").eq("id", id).single();

  if (!course) {
    return <div className="p-10">Khong tim thay khoa hoc</div>;
  }

  const { data: chapters } = await supabase.from("chapters").select("*").eq("course_id", id).order("position");

  const chapterData = await Promise.all(
    (chapters || []).map(async (chapter) => {
      const { data: lessons } = await supabase
        .from("lessons")
        .select("*")
        .eq("chapter_id", chapter.id)
        .order("position");

      const sortedLessons = sortLessonsByDisplayOrder(lessons || []);
      const lessonIds = sortedLessons.map((lesson) => lesson.id);
      const { data: sections } = lessonIds.length
        ? await supabase.from("lesson_sections").select("*").in("lesson_id", lessonIds)
        : { data: [] };

      const sectionCountByLesson = (sections || []).reduce(
        (acc: Record<string, number>, section: any) => {
          acc[section.lesson_id] = (acc[section.lesson_id] || 0) + 1;
          return acc;
        },
        {}
      );

      return {
        ...chapter,
        lessons: sortedLessons,
        sectionCountByLesson,
        totalSections: (sections || []).length,
      };
    })
  );

  const totalLessons = chapterData.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
  const totalSections = chapterData.reduce((sum, chapter) => sum + chapter.totalSections, 0);

  return (
    <div>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black">{course.title}</h1>
          <p className="mt-2 text-slate-500">{course.slug}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-2">{chapterData.length} chuong</span>
            <span className="rounded-full bg-slate-100 px-3 py-2">{totalLessons} bai hoc</span>
            <span className="rounded-full bg-slate-100 px-3 py-2">{totalSections} tiet hoc</span>
          </div>
        </div>

        <Link
          href={`/admin/courses/${id}/new-chapter`}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white"
        >
          <Plus size={18} />
          Them chuong
        </Link>
      </div>

      <div className="space-y-6">
        {chapterData.map((chapter) => (
          <div key={chapter.id} className="rounded-3xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  CHUONG {chapter.position}: {chapter.title}
                </h2>
                <p className="mt-1 text-slate-600">{chapter.description || "Khong co mo ta"}</p>
              </div>

              <Link href={`/admin/chapters/${chapter.id}`} className="flex items-center gap-2 text-blue-600">
                Quan ly
                <ChevronRight size={18} />
              </Link>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-2">
              {chapter.lessons.map((lesson: any) => (
                <div key={lesson.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <BookOpen size={18} className="mt-1" />
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-sm text-slate-500">{lesson.slug}</p>
                      </div>
                    </div>

                    <Link href={`/admin/lessons/${lesson.id}`} className="text-sm text-blue-600">
                      Chinh sua
                    </Link>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs uppercase tracking-wide text-slate-500">Video mac dinh</div>
                      <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                        <PlayCircle size={16} />
                        {lesson.video_url ? "Da co" : "Chua co"}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs uppercase tracking-wide text-slate-500">So tiet hoc</div>
                      <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                        <Layers3 size={16} />
                        {chapter.sectionCountByLesson[lesson.id] || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
