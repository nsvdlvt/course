"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, UploadCloud } from "lucide-react";

import { supabase } from "@/lib/supabase";
import DocumentPicker from "@/components/admin/DocumentPicker";
import LessonSectionEditor from "@/components/admin/LessonSectionEditor";

type DocumentItem = {
  id: string;
  title: string;
  description?: string | null;
  folder_id?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  file_type?: string | null;
};

interface Props {
  chapterId: string;
  documents: DocumentItem[];
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
  const [availableDocuments, setAvailableDocuments] =
    useState<DocumentItem[]>(documents);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadFolderId, setUploadFolderId] = useState("");
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
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

  function getSafeFileName(fileName: string) {
    return fileName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9.-]/g, "_");
  }

  async function uploadAndSelectDocuments() {
    if (uploadFiles.length === 0) {
      alert("Chua chon file");
      return;
    }

    try {
      setUploadingDocuments(true);

      const uploadedDocuments: DocumentItem[] = [];

      for (const file of uploadFiles) {
        const filePath = `${Date.now()}-${crypto.randomUUID()}-${getSafeFileName(
          file.name
        )}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);

        if (uploadError) {
          alert(uploadError.message);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("documents").getPublicUrl(filePath);

        const title = file.name.replace(/\.[^/.]+$/, "");
        const { data: document, error: dbError } = await supabase
          .from("documents")
          .insert({
            title,
            description: "",
            folder_id: uploadFolderId || null,
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
          })
          .select()
          .single();

        if (dbError) {
          alert(dbError.message);
          continue;
        }

        uploadedDocuments.push(document);
      }

      if (uploadedDocuments.length > 0) {
        setAvailableDocuments((current) => [
          ...uploadedDocuments,
          ...current,
        ]);
        setSelectedDocuments((current) => [
          ...new Set([
            ...current,
            ...uploadedDocuments.map((document) => document.id),
          ]),
        ]);
        setUploadFiles([]);
      }
    } finally {
      setUploadingDocuments(false);
    }
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
          documents={availableDocuments}
          folders={folders}
          selectedIds={selectedDocuments}
          onChange={setSelectedDocuments}
        />
      </div>

      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <div className="mb-4 flex items-center gap-2 font-semibold">
          <UploadCloud size={20} />
          Upload tai lieu cho bai hoc nay
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-white px-4 py-3 hover:bg-slate-50">
            <FileText size={20} className="text-blue-600" />
            <span className="font-medium">
              {uploadFiles.length > 0
                ? `${uploadFiles.length} file da chon`
                : "Chon file de upload"}
            </span>
            <input
              hidden
              multiple
              type="file"
              onChange={(event) =>
                setUploadFiles(Array.from(event.target.files || []))
              }
            />
          </label>

          <select
            value={uploadFolderId}
            onChange={(event) => setUploadFolderId(event.target.value)}
            className="rounded-2xl border bg-white px-4 py-3"
          >
            <option value="">Khong chon thu muc</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        {uploadFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadFiles.map((file) => (
              <div
                key={`${file.name}-${file.size}`}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm"
              >
                <span className="font-medium">{file.name}</span>
                <span className="text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={uploadAndSelectDocuments}
          disabled={uploadingDocuments || uploadFiles.length === 0}
          className="mt-4 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploadingDocuments
            ? "Dang upload..."
            : "Upload va chon cho bai hoc"}
        </button>
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
