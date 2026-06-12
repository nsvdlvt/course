"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Save,
  UploadCloud,
} from "lucide-react";

import DocumentDeleteButton from "@/components/admin/DocumentDeleteButton";
import { supabase } from "@/lib/supabase";

type DocumentItem = {
  id: string;
  title: string | null;
  description: string | null;
  folder_id: string | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
};

type FolderItem = {
  id: string;
  name: string;
};

interface DocumentEditorProps {
  document: DocumentItem;
  folders: FolderItem[];
}

function makeSafeStorageName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_");
}

function getStoragePath(fileUrl: string | null) {
  if (!fileUrl) return null;

  try {
    const url = new URL(fileUrl);
    const marker = "/storage/v1/object/public/documents/";
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return null;

    return decodeURIComponent(
      url.pathname.slice(markerIndex + marker.length)
    );
  } catch {
    return null;
  }
}

export default function DocumentEditor({
  document,
  folders,
}: DocumentEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(document.title || "");
  const [description, setDescription] = useState(
    document.description || ""
  );
  const [folderId, setFolderId] = useState(
    document.folder_id || ""
  );
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function uploadReplacementFile() {
    if (!file) return null;

    const safeName = makeSafeStorageName(file.name);
    const filePath = `${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filePath);

    return {
      file_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      path: filePath,
    };
  }

  async function saveDocument() {
    if (!title.trim()) {
      alert("Nhap ten tai lieu");
      return;
    }

    let uploadedPath: string | null = null;

    try {
      setSaving(true);

      const replacement = await uploadReplacementFile();
      uploadedPath = replacement?.path || null;

      const { error } = await supabase
        .from("documents")
        .update({
          title: title.trim(),
          description,
          folder_id: folderId || null,
          ...(replacement
            ? {
                file_url: replacement.file_url,
                file_name: replacement.file_name,
                file_size: replacement.file_size,
                file_type: replacement.file_type,
              }
            : {}),
        })
        .eq("id", document.id);

      if (error) {
        throw error;
      }

      if (replacement) {
        const oldPath = getStoragePath(document.file_url);

        if (oldPath) {
          await supabase.storage.from("documents").remove([oldPath]);
        }
      }

      alert("Da luu tai lieu");
      router.refresh();
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage.from("documents").remove([uploadedPath]);
      }

      alert(error instanceof Error ? error.message : "Khong the luu tai lieu");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/documents"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Quay lai tai lieu
          </Link>

          <h1 className="text-4xl font-black">
            Chinh sua tai lieu
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          {document.file_url && (
            <a
              href={document.file_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-slate-700 shadow hover:bg-slate-50"
            >
              <ExternalLink size={18} />
              Mo file
            </a>
          )}

          <button
            type="button"
            onClick={saveDocument}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Dang luu..." : "Luu"}
          </button>

          <DocumentDeleteButton
            documentId={document.id}
            fileUrl={document.file_url}
            variant="solid"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow">
            <h2 className="mb-4 font-bold">Thong tin tai lieu</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-medium">
                  Ten tai lieu
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-xl border px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Mo ta
                </label>
                <textarea
                  rows={8}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full rounded-xl border px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Thu muc
                </label>
                <select
                  value={folderId}
                  onChange={(event) => setFolderId(event.target.value)}
                  className="w-full rounded-xl border px-4 py-3"
                >
                  <option value="">Khong chon</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <h2 className="mb-4 font-bold">Thay file</h2>

            <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 p-10 text-center transition hover:bg-slate-50">
              <input
                hidden
                type="file"
                onChange={(event) =>
                  setFile(event.target.files?.[0] || null)
                }
              />
              <UploadCloud size={44} className="mx-auto mb-3 text-slate-500" />
              <p className="font-semibold">
                Chon file moi
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Bo trong neu chi sua thong tin
              </p>
            </label>

            {file && (
              <div className="mt-4 rounded-2xl bg-slate-100 p-4">
                <div className="font-semibold">{file.name}</div>
                <div className="text-sm text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-3xl bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileText size={24} />
            </div>
            <div>
              <div className="font-bold">
                File hien tai
              </div>
              <div className="text-sm text-slate-500">
                {document.file_type || "Khong ro loai file"}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div>
              <div className="text-slate-500">Ten file</div>
              <div className="break-words font-medium">
                {document.file_name || "Chua co"}
              </div>
            </div>

            <div>
              <div className="text-slate-500">Dung luong</div>
              <div className="font-medium">
                {document.file_size
                  ? `${(document.file_size / 1024 / 1024).toFixed(2)} MB`
                  : "Khong ro"}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
