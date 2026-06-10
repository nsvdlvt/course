import Link from "next/link";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
        {(lessons || []).map((lesson) => (
          <div
            key={lesson.id}
            className="
              bg-white
              rounded-2xl
              p-5
              shadow
            "
          >
            {lesson.title}
          </div>
        ))}
      </div>
    </div>
  );
}