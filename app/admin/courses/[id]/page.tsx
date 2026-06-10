import Link from "next/link";
import {
  Plus,
  ChevronRight,
  BookOpen,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) {
    return (
      <div className="p-10">
        Không tìm thấy khóa học
      </div>
    );
  }

  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("course_id", id)
    .order("position");

  const chapterData = await Promise.all(
    (chapters || []).map(async (chapter) => {
      const { data: lessons } = await supabase
        .from("lessons")
        .select("*")
        .eq("chapter_id", chapter.id)
        .order("position");

      return {
        ...chapter,
        lessons: lessons || [],
      };
    })
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-5xl font-black">
            {course.title}
          </h1>

          <p className="text-slate-500 mt-2">
            {course.slug}
          </p>
        </div>

        <Link
          href={`/admin/courses/${id}/new-chapter`}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-blue-600
            px-5
            py-3
            text-white
          "
        >
          <Plus size={18} />
          Thêm chương
        </Link>
      </div>

      {/* Chapters */}
      <div className="space-y-6">
        {chapterData.map((chapter) => (
          <div
            key={chapter.id}
            className="
              rounded-3xl
              bg-white
              p-6
              shadow
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  CHƯƠNG {chapter.position}
                </h2>

                <p className="text-slate-600 mt-1">
                  {chapter.title}
                </p>
              </div>

              <Link
                href={`/admin/chapters/${chapter.id}`}
                className="
                  flex
                  items-center
                  gap-2
                  text-blue-600
                "
              >
                Quản lý
                <ChevronRight size={18} />
              </Link>
            </div>

            {/* Lessons */}
            <div className="mt-5 space-y-3">
              {chapter.lessons.map(
                (lesson: any) => (
                  <div
                    key={lesson.id}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      border
                      border-slate-200
                      p-4
                    "
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen
                        size={18}
                      />

                      <div>
                        <p className="font-medium">
                          {lesson.title}
                        </p>

                        <p className="text-sm text-slate-500">
                          {lesson.slug}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/admin/lessons/${lesson.id}`}
                      className="
                        text-blue-600
                        text-sm
                      "
                    >
                      Chỉnh sửa
                    </Link>
                  </div>
                )
              )}

              <Link
                href={`/admin/chapters/${chapter.id}/new-lesson`}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-slate-100
                  px-4
                  py-3
                  text-sm
                "
              >
                <Plus size={16} />
                Thêm bài học
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}