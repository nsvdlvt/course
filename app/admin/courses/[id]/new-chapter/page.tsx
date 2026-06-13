import Link from "next/link";

import ChapterForm from "@/components/admin/ChapterForm";
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewChapterPage({ params }: PageProps) {
  const { id } = await params;

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", id)
    .single();

  if (!course) {
    return <div className="p-10">Khong tim thay khoa hoc</div>;
  }

  return (
    <div className="max-w-4xl">
      <Link href={`/admin/courses/${id}`} className="text-sm text-blue-600">
        Quay lai khoa hoc
      </Link>

      <div className="mb-8 mt-4">
        <h1 className="text-4xl font-black">Them chuong</h1>
        <p className="mt-2 text-slate-500">{course.title}</p>
      </div>

      <ChapterForm courseId={id} />
    </div>
  );
}
