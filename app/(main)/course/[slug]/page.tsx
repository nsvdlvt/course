import Link from "next/link";
import {
  Atom,
  Sigma,
  PlayCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import ChapterAccordion from "@/components/ChapterAccordion";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CoursePage({
  params,
}: PageProps) {
  const { slug } =
    await params;

  const { data: course } =
    await supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .single();

  if (!course) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">
          Không tìm thấy khóa học
        </h1>
      </main>
    );
  }

  const { data: chapters } =
    await supabase
      .from("chapters")
      .select("*")
      .eq(
        "course_id",
        course.id
      )
      .order("position");

  const chapterData =
    await Promise.all(
      (chapters || []).map(
        async (
          chapter
        ) => {
          const {
            data: lessons,
          } =
            await supabase
              .from(
                "lessons"
              )
              .select("*")
              .eq(
                "chapter_id",
                chapter.id
              )
              .order(
                "position"
              );

          return {
            ...chapter,
            lessons:
              lessons || [],
          };
        }
      )
    );

  const totalLessons =
    chapterData.reduce(
      (
        sum,
        chapter
      ) =>
        sum +
        chapter
          .lessons.length,
      0
    );

  const CourseIcon =
    slug === "vatli"
      ? Atom
      : Sigma;

  const courseColors =
    slug === "vatli"
      ? "from-cyan-500 via-sky-500 to-blue-600"
      : "from-emerald-500 via-green-500 to-teal-600";

  return (
    <main
      className="
        min-h-screen
        bg-gradient-to-br
        from-slate-50
        via-white
        to-cyan-50
      "
    >
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/home"
            className="
              inline-flex
              items-center
              gap-2
              text-blue-600
              hover:text-blue-800
            "
          >
            ← Quay lại
          </Link>

          <div className="mt-6 flex items-center gap-5">
            <div
              className={`
                h-24
                w-24
                rounded-3xl
                bg-gradient-to-br
                ${courseColors}
                flex
                items-center
                justify-center
                text-white
                shadow-xl
              `}
            >
              <CourseIcon
                size={48}
              />
            </div>

            <div>
              <h1
                className="
                  text-5xl
                  font-black
                  text-slate-800
                "
              >
                {course.title}
              </h1>

              <p className="mt-2 text-slate-500">
                {
                  chapterData.length
                }{" "}
                chương •{" "}
                {
                  totalLessons
                }{" "}
                bài học
              </p>
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div className="space-y-5">
          {chapterData.map(
            (chapter) => (
              <ChapterAccordion
                key={
                  chapter.id
                }
                title={`CHƯƠNG ${chapter.position}: ${chapter.title}`}
              >
                <div className="divide-y">
                  {chapter.lessons.map(
                    (
                      lesson: any
                    ) => (
                      <Link
                        key={
                          lesson.id
                        }
                        href={`/course/${course.slug}/${lesson.slug}`}
                        className="
                          flex
                          items-center
                          justify-between
                          px-6
                          py-4

                          hover:bg-slate-50
                          transition
                        "
                      >
                        <div className="flex items-center gap-3">
                          <PlayCircle
                            size={
                              20
                            }
                            className="
                              text-blue-600
                            "
                          />

                          <span className="font-medium">
                            {
                              lesson.title
                            }
                          </span>
                        </div>

                        <div
                          className="
                            text-sm
                            text-slate-500
                          "
                        >
                          {lesson.duration ||
                            ""}
                        </div>
                      </Link>
                    )
                  )}

                  {chapter
                    .lessons
                    .length ===
                    0 && (
                    <div
                      className="
                        px-6
                        py-5
                        text-slate-500
                      "
                    >
                      Chưa có
                      bài học
                    </div>
                  )}
                </div>
              </ChapterAccordion>
            )
          )}
        </div>
      </div>
    </main>
  );
}