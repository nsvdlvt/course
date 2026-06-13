import Link from "next/link";
import { Layers3, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { sortLessonsByDisplayOrder } from "@/lib/lesson-sort";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: chapter } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", id)
    .single();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("chapter_id", id)
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

  return (
    <div>
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black">
            {chapter?.title}
          </h1>
        </div>

        <Link
          href={`/admin/chapters/${id}/new-lesson`}
          className="
            bg-blue-600
            text-white
            px-5
            py-3
            rounded-xl
            flex
            items-center
            gap-2
          "
        >
          <Plus size={18} />
          Thêm bài học
        </Link>
      </div>

      <div className="space-y-3">
        {sortedLessons.map((lesson) => (
          <div key={lesson.id} className="rounded-2xl bg-white p-5 shadow">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{lesson.title}</div>
                <div className="mt-1 text-sm text-slate-500">{lesson.slug}</div>
              </div>

              <Link
                href={`/admin/lessons/${lesson.id}`}
                className="text-sm text-blue-600"
              >
                Chinh sua
              </Link>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
              <Layers3 size={16} />
              {sectionCountByLesson[lesson.id] || 0} tiet hoc
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
