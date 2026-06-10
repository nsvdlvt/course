"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import DocumentPicker from "@/components/admin/DocumentPicker";

interface Props {
  chapterId: string;
  documents: any[];
  folders: any[];
}

export default function LessonForm({
  chapterId,
  documents,
  folders,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [videoUrl, setVideoUrl] =
    useState("");

  const [duration, setDuration] =
    useState("");

  const [position, setPosition] =
    useState(1);

  const [isNew, setIsNew] =
    useState(true);

  const [
    selectedDocuments,
    setSelectedDocuments,
  ] = useState<string[]>([]);

  function generateSlug(
    value: string
  ) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );
  }

  async function createLesson() {
    if (!title.trim()) {
      alert("Nhập tên bài học");
      return;
    }

    try {
      setLoading(true);

      const {
        data: lesson,
        error,
      } = await supabase
        .from("lessons")
        .insert({
          chapter_id:
            chapterId,

          title,

          slug:
            slug ||
            generateSlug(
              title
            ),

          description,

          video_url:
            videoUrl,

          duration,

          position,

          views: 0,

          is_new:
            isNew,
        })
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      if (
        selectedDocuments.length > 0
      ) {
        const {
          error:
            documentError,
        } =
          await supabase
            .from(
              "lesson_documents"
            )
            .insert(
              selectedDocuments.map(
                (
                  documentId
                ) => ({
                  lesson_id:
                    lesson.id,
                  document_id:
                    documentId,
                })
              )
            );

        if (
          documentError
        ) {
          alert(
            documentError.message
          );
          return;
        }
      }

      alert(
        "Tạo bài học thành công"
      );

      router.push(
        `/admin/chapters/${chapterId}`
      );

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        bg-white
        rounded-3xl
        shadow
        p-8
        space-y-6
      "
    >
      <div>
        <label className="font-medium">
          Tên bài học
        </label>

        <input
          value={title}
          onChange={(e) => {
            setTitle(
              e.target.value
            );

            if (!slug) {
              setSlug(
                generateSlug(
                  e.target.value
                )
              );
            }
          }}
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

      <div>
        <label className="font-medium">
          Slug
        </label>

        <input
          value={slug}
          onChange={(e) =>
            setSlug(
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

      <div>
        <label className="font-medium">
          Mô tả
        </label>

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

      <div>
        <label className="font-medium">
          Link video
        </label>

        <input
          value={videoUrl}
          onChange={(e) =>
            setVideoUrl(
              e.target.value
            )
          }
          placeholder="https://youtube.com/watch?v=..."
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

      <div>
        <label className="font-medium">
          Thời lượng
        </label>

        <input
          value={duration}
          onChange={(e) =>
            setDuration(
              e.target.value
            )
          }
          placeholder="45 phút"
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

      <div>
        <label className="font-medium">
          Thứ tự
        </label>

        <input
          type="number"
          value={position}
          onChange={(e) =>
            setPosition(
              Number(
                e.target.value
              )
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

      <label
        className="
          flex
          items-center
          gap-3
        "
      >
        <input
          type="checkbox"
          checked={isNew}
          onChange={(e) =>
            setIsNew(
              e.target.checked
            )
          }
        />

        Bài học mới
      </label>

      <div>
        <label className="font-medium">
          Tài liệu đính kèm
        </label>

        <div className="mt-2">
          <DocumentPicker
            documents={documents}
            folders={folders}
            selectedIds={
              selectedDocuments
            }
            onChange={
              setSelectedDocuments
            }
          />
        </div>
      </div>

      <button
        onClick={createLesson}
        disabled={loading}
        className="
          rounded-xl
          bg-blue-600
          px-6
          py-3
          text-white
          disabled:opacity-50
        "
      >
        {loading
          ? "Đang tạo..."
          : "Tạo bài học"}
      </button>
    </div>
  );
}