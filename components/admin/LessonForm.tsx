"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import DocumentPicker from "@/components/admin/DocumentPicker";
import LessonSectionEditor from "@/components/admin/LessonSectionEditor";

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

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [position, setPosition] = useState(1);
  const [isNew, setIsNew] = useState(true);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [sections, setSections] = useState<
    { title: string; video_url: string; position: number }[]
  >([]);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function createLesson() {
    if (!title.trim()) {
      alert("Nhap ten bai hoc");
      return;
    }

    try {
      setLoading(true);

      const { data: lesson, error } = await supabase
        .from("lessons")
        .insert({
          chapter_id: chapterId,
          title,
          slug: slug || generateSlug(title),
          description,
          video_url: videoUrl,
          position,
          views: 0,
          is_new: isNew,
        })
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      if (sections.length > 0) {
        const { error: sectionError } = await supabase.from("lesson_sections").insert(
          sections.map((section) => ({
            lesson_id: lesson.id,
            title: section.title,
            video_url: section.video_url,
            position: section.position,
          }))
        );

        if (sectionError) {
          alert(sectionError.message);
          return;
        }
      }

      if (selectedDocuments.length > 0) {
        const links = selectedDocuments.map((documentId) => ({
          lesson_id: lesson.id,
          document_id: documentId,
        }));

        const { error: documentError } = await supabase
          .from("lesson_documents")
          .insert(links);

        if (documentError) {
          alert(documentError.message);
          return;
        }
      }

      alert("Tao bai hoc thanh cong");
      router.push(`/admin/chapters/${chapterId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl bg-white p-8 shadow">
      <div>
        <label className="font-medium">Ten bai hoc</label>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slug) {
              setSlug(generateSlug(e.target.value));
            }
          }}
          className="mt-2 w-full rounded-xl border px-4 py-3"
        />
      </div>

      <div>
        <label className="font-medium">Slug</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-2 w-full rounded-xl border px-4 py-3"
        />
      </div>

      <div>
        <label className="font-medium">Mo ta</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2 w-full rounded-xl border px-4 py-3"
        />
      </div>

      <div>
        <label className="font-medium">Link video mac dinh</label>
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="mt-2 w-full rounded-xl border px-4 py-3"
        />
        <p className="mt-2 text-sm text-slate-500">
          Neu khong co tiet hoc, video nay se duoc dung.
        </p>
      </div>

      <div>
        <label className="font-medium">Thu tu</label>
        <input
          type="number"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="mt-2 w-full rounded-xl border px-4 py-3"
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isNew}
          onChange={(e) => setIsNew(e.target.checked)}
        />
        Bai hoc moi
      </label>

      <div>
        <label className="mb-3 block font-medium">Tiet hoc</label>
        <LessonSectionEditor sections={sections} onChange={setSections} />
      </div>

      <div>
        <label className="mb-3 block font-medium">Tai lieu dinh kem</label>
        <DocumentPicker
          documents={documents}
          folders={folders}
          selectedIds={selectedDocuments}
          onChange={setSelectedDocuments}
        />
      </div>

      <button
        onClick={createLesson}
        disabled={loading}
        className="rounded-xl bg-blue-600 px-6 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Dang tao..." : "Tao bai hoc"}
      </button>
    </div>
  );
}
