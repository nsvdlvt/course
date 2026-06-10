"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LessonEditor({
  lesson,
}: {
  lesson: any;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(
    lesson.title || ""
  );

  const [slug, setSlug] = useState(
    lesson.slug || ""
  );

  const [description, setDescription] =
    useState(
      lesson.description || ""
    );

  const [videoUrl, setVideoUrl] =
    useState(
      lesson.video_url || ""
    );

  const [content, setContent] =
    useState(
      lesson.content || ""
    );

  const [loading, setLoading] =
    useState(false);

  async function saveLesson() {
    setLoading(true);

    const { error } = await supabase
      .from("lessons")
      .update({
        title,
        slug,
        description,
        video_url: videoUrl,
        content,
      })
      .eq("id", lesson.id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Đã lưu");
    router.refresh();
  }

  async function deleteLesson() {
    const ok = confirm(
      "Xóa bài học này?"
    );

    if (!ok) return;

    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lesson.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Đã xóa");

    router.push("/admin/courses");
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-4xl font-black mb-8">
        Chỉnh sửa bài học
      </h1>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow">
          <label>Tên bài học</label>

          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="
              mt-2
              w-full
              border
              rounded-xl
              px-4
              py-3
            "
          />
        </div>

        <div className="bg-white p-6 rounded-3xl shadow">
          <label>Slug</label>

          <input
            value={slug}
            onChange={(e) =>
              setSlug(e.target.value)
            }
            className="
              mt-2
              w-full
              border
              rounded-xl
              px-4
              py-3
            "
          />
        </div>

        <div className="bg-white p-6 rounded-3xl shadow">
          <label>Mô tả</label>

          <textarea
            rows={4}
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            className="
              mt-2
              w-full
              border
              rounded-xl
              px-4
              py-3
            "
          />
        </div>

        <div className="bg-white p-6 rounded-3xl shadow">
          <label>Video URL</label>

          <input
            value={videoUrl}
            onChange={(e) =>
              setVideoUrl(
                e.target.value
              )
            }
            className="
              mt-2
              w-full
              border
              rounded-xl
              px-4
              py-3
            "
          />
        </div>

        <div className="bg-white p-6 rounded-3xl shadow">
          <label>Nội dung</label>

          <textarea
            rows={20}
            value={content}
            onChange={(e) =>
              setContent(
                e.target.value
              )
            }
            className="
              mt-2
              w-full
              border
              rounded-xl
              px-4
              py-3
              font-mono
            "
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={saveLesson}
            disabled={loading}
            className="
              bg-blue-600
              text-white
              px-6
              py-3
              rounded-xl
            "
          >
            {loading
              ? "Đang lưu..."
              : "Lưu thay đổi"}
          </button>

          <button
            onClick={deleteLesson}
            className="
              bg-red-500
              text-white
              px-6
              py-3
              rounded-xl
            "
          >
            Xóa bài học
          </button>
        </div>
      </div>
    </div>
  );
}