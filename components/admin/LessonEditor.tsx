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
import LessonSectionEditor from "./LessonSectionEditor";

interface LessonEditorProps {
  lesson: any;
  documents: any[];
  folders: any[];
  linkedDocuments: any[];
  sections: any[];
}

export default function LessonEditor({
  lesson,
  documents,
  folders,
  linkedDocuments,
  sections,
}: LessonEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(lesson.title || "");
  const [slug, setSlug] = useState(lesson.slug || "");
  const [description, setDescription] = useState(lesson.description || "");
  const [videoUrl, setVideoUrl] = useState(lesson.video_url || "");
  const [content, setContent] = useState(lesson.content || "");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>(
    linkedDocuments.map((item: any) => item.document_id)
  );
  const [lessonSections, setLessonSections] = useState<
    { id?: string; title: string; video_url: string; position: number }[]
  >(
    (sections || []).map((section: any) => ({
      id: section.id,
      title: section.title || "",
      video_url: section.video_url || "",
      position: section.position || 1,
    }))
  );

  async function saveLesson() {
    try {
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

      if (error) {
        alert(error.message);
        return;
      }

      const { error: deleteSectionError } = await supabase
        .from("lesson_sections")
        .delete()
        .eq("lesson_id", lesson.id);

      if (deleteSectionError) {
        alert(deleteSectionError.message);
        return;
      }

      if (lessonSections.length > 0) {
        const { error: sectionError } = await supabase
          .from("lesson_sections")
          .insert(
            lessonSections.map((section) => ({
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

      await supabase.from("lesson_documents").delete().eq("lesson_id", lesson.id);

      if (selectedDocuments.length > 0) {
        const { error: linkError } = await supabase.from("lesson_documents").insert(
          selectedDocuments.map((documentId) => ({
            lesson_id: lesson.id,
            document_id: documentId,
          }))
        );

        if (linkError) {
          alert(linkError.message);
          return;
        }
      }

      alert("Da luu bai hoc");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function deleteLesson() {
    const ok = confirm("Ban chac chan muon xoa bai hoc nay?");
    if (!ok) return;

    const { error } = await supabase.from("lessons").delete().eq("id", lesson.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Da xoa");
    router.push("/admin/courses");
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Chinh sua bai hoc</h1>
          <p className="mt-2 text-slate-500">{lesson.title}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={saveLesson}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            <Save size={18} />
            {loading ? "Dang luu..." : "Luu"}
          </button>

          <button
            onClick={deleteLesson}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-white hover:bg-red-600"
          >
            <Trash2 size={18} />
            Xoa
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow">
        <h2 className="mb-4 font-bold">Thong tin bai hoc</h2>
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ten bai hoc"
            className="w-full rounded-xl border px-4 py-3"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Slug"
            className="w-full rounded-xl border px-4 py-3"
          />
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mo ta"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Video size={20} />
          <h2 className="font-bold">Video bai hoc</h2>
        </div>

        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/..."
          className="w-full rounded-xl border px-4 py-3"
        />
        <p className="mt-2 text-sm text-slate-500">
          Neu bai hoc co tiet hoc, video nay la fallback khi tiet hoc khong co video.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <FileText size={20} />
          <h2 className="font-bold">Tiet hoc</h2>
        </div>
        <LessonSectionEditor sections={lessonSections} onChange={setLessonSections} />
      </div>

      <div className="rounded-3xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <FileText size={20} />
          <h2 className="font-bold">Tai lieu dinh kem</h2>
        </div>

        <div className="mb-4 space-y-2">
          {documents
            .filter((doc) => selectedDocuments.includes(doc.id))
            .map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3"
              >
                {doc.title}
              </div>
            ))}
        </div>

        <DocumentPicker
          documents={documents}
          folders={folders}
          selectedIds={selectedDocuments}
          onChange={setSelectedDocuments}
        />
      </div>

      <div className="rounded-3xl bg-white p-6 shadow">
        <h2 className="mb-4 font-bold">Noi dung bai hoc</h2>
        <textarea
          rows={25}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-xl border px-4 py-3 font-mono"
        />
      </div>
    </div>
  );
}
