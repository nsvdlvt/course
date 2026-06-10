import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  BookOpen,
  FileText,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

export default async function HomePage() {
  const [
    { count: courseCount },
    { count: lessonCount },
    { count: documentCount },
    { data: courses },
    { data: documents },
  ] = await Promise.all([
    supabase
      .from("courses")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("lessons")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("documents")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("courses")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(6),

    supabase
      .from("documents")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(5),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* HEADER */}
      <section className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900">
          NSVDCourse
        </h1>

        <p className="mt-3 text-slate-600 text-lg">
          Aim30+THPTQG - Học thông minh hơn, kinh tế hơn và hiệu quả hơn
        </p>
      </section>

      {/* STATS */}
      <section className="grid gap-5 md:grid-cols-3 mb-12">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-blue-600" />
            <span className="font-semibold">
              Khóa học
            </span>
          </div>

          <p className="mt-4 text-4xl font-black">
            {courseCount || 0}
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="text-emerald-600" />
            <span className="font-semibold">
              Bài học
            </span>
          </div>

          <p className="mt-4 text-4xl font-black">
            {lessonCount || 0}
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="text-violet-600" />
            <span className="font-semibold">
              Tài liệu
            </span>
          </div>

          <p className="mt-4 text-4xl font-black">
            {documentCount || 0}
          </p>
        </div>
      </section>

      {/* COURSES */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-3xl font-black">
            Khóa học mới
          </h2>

          <Link
            href="/courses"
            className="flex items-center gap-2 text-blue-600 font-semibold"
          >
            Xem tất cả
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses?.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="
                rounded-3xl
                bg-white
                border
                border-slate-200
                p-6
                shadow-sm
                hover:shadow-md
                transition
              "
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BookOpen className="text-blue-600" />
                </div>

                <h3 className="font-bold text-lg">
                  {course.title}
                </h3>
              </div>

              {course.description && (
                <p className="text-slate-600 line-clamp-3">
                  {course.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* DOCUMENTS */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-3xl font-black">
            Tài liệu mới nhất
          </h2>

          <Link
            href="/documents"
            className="flex items-center gap-2 text-blue-600 font-semibold"
          >
            Xem tất cả
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden">
          {documents?.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="
                flex
                items-center
                justify-between
                px-6
                py-5
                border-b
                last:border-b-0
                hover:bg-slate-50
              "
            >
              <div>
                <p className="font-semibold">
                  {doc.title}
                </p>

                <p className="text-sm text-slate-500">
                  {doc.file_name}
                </p>
              </div>

              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}