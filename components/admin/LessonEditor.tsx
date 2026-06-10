"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Trash2,
  FileText,
  Video,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import DocumentPicker from "./DocumentPicker";

interface LessonEditorProps {
  lesson: any;
  documents: any[];
  folders: any[];
  linkedDocuments: any[];
}

export default function LessonEditor({
  lesson,
  documents,
  folders,
  linkedDocuments,
}: LessonEditorProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [title, setTitle] =
    useState(lesson.title || "");

  const [slug, setSlug] =
    useState(lesson.slug || "");

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

  const [selectedDocuments, setSelectedDocuments] =
    useState<string[]>(
      linkedDocuments.map(
        (item: any) =>
          item.document_id
      )
    );

  async function saveLesson() {
    try {
      setLoading(true);

      const { error } =
        await supabase
          .from("lessons")
          .update({
            title,
            slug,
            description,
            video_url: videoUrl,
            content,
          })
          .eq("id", lesson.id);

      if (error) {
        alert(error.message);
        return;
      }

      await supabase
        .from("lesson_documents")
        .delete()
        .eq("lesson_id", lesson.id);

      if (
        selectedDocuments.length > 0
      ) {
        const { error: linkError } =
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

        if (linkError) {
          alert(
            linkError.message
          );
          return;
        }
      }

      alert(
        "Đã lưu bài học"
      );

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function deleteLesson() {
    const ok = confirm(
      "Bạn chắc chắn muốn xóa bài học này?"
    );

    if (!ok) return;

    const { error } =
      await supabase
        .from("lessons")
        .delete()
        .eq("id", lesson.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Đã xóa");

    router.push(
      "/admin/courses"
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">
            Chỉnh sửa bài học
          </h1>

          <p className="text-slate-500 mt-2">
            {lesson.title}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={saveLesson}
            disabled={loading}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5
              py-3
              text-white
              hover:bg-blue-700
            "
          >
            <Save size={18} />

            {loading
              ? "Đang lưu..."
              : "Lưu"}
          </button>

          <button
            onClick={
              deleteLesson
            }
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-red-500
              px-5
              py-3
              text-white
              hover:bg-red-600
            "
          >
            <Trash2
              size={18}
            />
            Xóa
          </button>
        </div>
      </div>

      {/* Thông tin */}
      <div className="bg-white rounded-3xl p-6 shadow">
        <h2 className="font-bold mb-4">
          Thông tin bài học
        </h2>

        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            placeholder="Tên bài học"
            className="
              w-full
              rounded-xl
              border
              px-4
              py-3
            "
          />

          <input
            value={slug}
            onChange={(e) =>
              setSlug(
                e.target.value
              )
            }
            placeholder="Slug"
            className="
              w-full
              rounded-xl
              border
              px-4
              py-3
            "
          />

          <textarea
            rows={4}
            value={
              description
            }
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            placeholder="Mô tả"
            className="
              w-full
              rounded-xl
              border
              px-4
              py-3
            "
          />
        </div>
      </div>

      {/* Video */}
      <div className="bg-white rounded-3xl p-6 shadow">
        <div className="flex items-center gap-2 mb-4">
          <Video size={20} />

          <h2 className="font-bold">
            Video
          </h2>
        </div>

        <input
          value={videoUrl}
          onChange={(e) =>
            setVideoUrl(
              e.target.value
            )
          }
          placeholder="https://youtube.com/..."
          className="
            w-full
            rounded-xl
            border
            px-4
            py-3
          "
        />
      </div>

      {/* Documents */}
      <div className="bg-white rounded-3xl p-6 shadow">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} />

          <h2 className="font-bold">
            Tài liệu đính kèm
          </h2>
        </div>

        <div className="space-y-2 mb-4">
          {documents
            .filter((doc) =>
              selectedDocuments.includes(
                doc.id
              )
            )
            .map((doc) => (
              <div
                key={doc.id}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-slate-100
                  px-4
                  py-3
                "
              >
                📄 {doc.title}
              </div>
            ))}
        </div>

        <DocumentPicker
          documents={
            documents
          }
          folders={folders}
          selectedIds={
            selectedDocuments
          }
          onChange={
            setSelectedDocuments
          }
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl p-6 shadow">
        <h2 className="font-bold mb-4">
          Nội dung bài học
        </h2>

        <textarea
          rows={25}
          value={content}
          onChange={(e) =>
            setContent(
              e.target.value
            )
          }
          className="
            w-full
            rounded-xl
            border
            px-4
            py-3
            font-mono
          "
        />
      </div>
    </div>
  );
}