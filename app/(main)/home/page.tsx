import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Clock3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  Sparkles,
} from "lucide-react";

type Course = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  created_at?: string | null;
};

type Document = {
  id: string;
  title: string;
  file_name?: string | null;
  file_type?: string | null;
  created_at?: string | null;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "Mới cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const statCards = (
  courseCount: number,
  lessonCount: number,
  documentCount: number
) => [
  {
    label: "Khóa học",
    value: courseCount,
    icon: GraduationCap,
    tone: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  {
    label: "Bài học",
    value: lessonCount,
    icon: BookOpenCheck,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  {
    label: "Tài liệu",
    value: documentCount,
    icon: FileText,
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
  },
];

export default async function HomePage() {
  const [
    { count: courseCount },
    { count: lessonCount },
    { count: documentCount },
    { data: courses },
    { data: documents },
  ] = await Promise.all([
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("lessons").select("*", { count: "exact", head: true }),
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase
      .from("courses")
      .select("id, slug, title, description, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("documents")
      .select("id, title, file_name, file_type, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const latestCourses = (courses ?? []) as Course[];
  const latestDocuments = (documents ?? []) as Document[];
  const stats = statCards(courseCount ?? 0, lessonCount ?? 0, documentCount ?? 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                <LayoutDashboard size={16} />
                Dashboard
              </span>
              <span>Aim30+ THPTQG</span>
            </div>

            <div className="mt-8 max-w-3xl">
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Chào mừng quay lại NSVDCourse
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Theo dõi khóa học, vào nhanh tài liệu mới và tiếp tục việc học
                trong một không gian gọn gàng hơn.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/course"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Vào khóa học
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/documents"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                Mở tài liệu
                <FileText size={18} />
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-300">
                  Tổng quan học tập
                </p>
                <p className="mt-2 text-3xl font-black">
                  {(courseCount ?? 0) + (lessonCount ?? 0) + (documentCount ?? 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                <Sparkles size={24} />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm text-slate-300">Khóa học mới</span>
                <span className="font-bold">{latestCourses.length}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm text-slate-300">Tài liệu mới</span>
                <span className="font-bold">{latestDocuments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Trạng thái</span>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-200">
                  Sẵn sàng
                </span>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-3xl font-black text-slate-950">
                      {item.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ring-1 ${item.tone}`}
                  >
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-black text-slate-950">Khóa học gần đây</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Các lớp vừa được cập nhật trên hệ thống
                </p>
              </div>
              <Link
                href="/course"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800"
              >
                Tất cả
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              {latestCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/course/${course.slug}`}
                  className="rounded-lg border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <BookOpen size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 font-bold text-slate-950">
                        {course.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                        <Clock3 size={13} />
                        {formatDate(course.created_at)}
                      </p>
                    </div>
                  </div>
                  {course.description && (
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                      {course.description}
                    </p>
                  )}
                </Link>
              ))}

              {latestCourses.length === 0 && (
                <div className="col-span-full rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  Chưa có khóa học nào.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-black text-slate-950">Tài liệu mới</h2>
                <p className="mt-1 text-sm text-slate-500">
                  File vừa được đưa lên thư viện
                </p>
              </div>
              <Link
                href="/documents"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800"
              >
                Thư viện
                <LibraryBig size={16} />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {latestDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                      <FileText size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">
                        {doc.title}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {doc.file_name || doc.file_type || formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="shrink-0 text-slate-400" size={17} />
                </Link>
              ))}

              {latestDocuments.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-slate-500">
                  Chưa có tài liệu nào.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
