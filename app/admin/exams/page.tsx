import Link from "next/link";
import { Edit3, FileText, Plus } from "lucide-react";

import { supabase } from "@/lib/supabase";

type ExamItem = {
  id: string;
  title: string;
  slug: string;
  duration_minutes: number | null;
  question_count: number | null;
  exam_type?: string | null;
  lesson_id?: string | null;
};

export default async function AdminExamsPage() {
  const { data: exams } = await supabase
    .from("exams")
    .select("id,title,slug,duration_minutes,question_count,exam_type,lesson_id")
    .order("title");

  const items = (exams || []) as ExamItem[];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Đề thi</h1>
          <p className="mt-2 text-slate-500">Quản lý đề thi online</p>
        </div>

        <Link
          href="/admin/exams/new"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Thêm đề thi
        </Link>
      </div>

      <div className="space-y-4">
        {items.map((exam) => (
          <div
            key={exam.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow"
          >
            <Link
              href={`/admin/exams/${exam.id}`}
              className="flex min-w-0 flex-1 items-center gap-4"
            >
              <FileText className="shrink-0 text-blue-600" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{exam.title}</p>
                <p className="truncate text-sm text-slate-500">
                  {exam.slug} • {exam.question_count || 0} câu •{" "}
                  {exam.duration_minutes || 0} phút
                </p>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
                {exam.lesson_id ? "Gắn bài học" : "Tự do"}
              </span>
              <Link
                href={`/admin/exams/${exam.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-700 hover:bg-slate-200"
              >
                <Edit3 size={16} />
                Sửa
              </Link>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Chưa có đề thi.
          </div>
        )}
      </div>
    </div>
  );
}
