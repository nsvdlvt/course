import Link from "next/link";
import { Clock3, FileText, PlayCircle } from "lucide-react";

import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type ExamItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_minutes: number | null;
  question_count: number | null;
  file_url: string | null;
  exam_type?: string | null;
  lesson_id?: string | null;
};

export default async function ExamPage() {
  const { data, error } = await supabase
    .from("exams")
    .select(
      "id,title,slug,description,duration_minutes,question_count,file_url,exam_type,lesson_id"
    )
    .or("exam_type.eq.free,lesson_id.is.null")
    .order("title");

  const exams = (data || []) as ExamItem[];

  return (
    <main className="min-h-screen bg-[#eef3f7] px-5 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1f6696]">
            Thi Online
          </p>
          <h1 className="mt-2 text-4xl font-black text-slate-950 md:text-5xl">
            Chọn đề thi tự do
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Chỉ hiển thị các đề thi tự do. Đề thi gắn theo bài học sẽ nằm trong
            từng bài học tương ứng.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            Chưa đọc được danh sách đề thi. Kiểm tra bảng <b>exams</b> trong
            database và các cột cần thiết.
          </div>
        ) : exams.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <FileText size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Chưa có đề thi tự do
            </h2>
            <p className="mt-2 text-slate-500">
              Khi thêm đề thi loại tự do vào database, đề sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {exams.map((exam) => (
              <Link
                key={exam.id}
                href={`/exam/${exam.slug}`}
                className="group flex min-h-64 flex-col rounded-3xl border border-white bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e5f2fb] text-[#1f6696]">
                  <FileText size={28} />
                </div>

                <h2 className="text-2xl font-black text-slate-950">
                  {exam.title}
                </h2>
                <p className="mt-3 line-clamp-3 flex-1 text-slate-500">
                  {exam.description || "Đề thi PDF, chọn đáp án trực tiếp."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2">
                    <Clock3 size={15} />
                    {exam.duration_minutes || 60} phút
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-2">
                    {exam.question_count || 19} câu
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-2 font-bold text-[#1f6696]">
                  <PlayCircle size={19} />
                  Bắt đầu làm bài
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
