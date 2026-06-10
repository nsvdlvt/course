"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Folder,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface Props {
  folders: any[];
}

export default function BulkDocumentUploader({
  folders,
}: Props) {
  const router = useRouter();

  const [files, setFiles] =
    useState<File[]>([]);

  const [folderId, setFolderId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [uploaded, setUploaded] =
    useState(0);

  async function uploadAll() {
    if (files.length === 0) {
      alert(
        "Chưa chọn file"
      );
      return;
    }

    setLoading(true);
    setUploaded(0);

    try {
      for (
        let i = 0;
        i < files.length;
        i++
      ) {
        const file = files[i];

const safeName = file.name
  .normalize("NFD")
  .replace(
    /[\u0300-\u036f]/g,
    ""
  )
  .replace(
    /[^a-zA-Z0-9.-]/g,
    "_"
  );

const filePath =
  `${Date.now()}-${safeName}`;

const {
  error: uploadError,
} = await supabase.storage
  .from("documents")
  .upload(filePath, file);

        if (uploadError) {
          alert(
            uploadError.message
          );
          continue;
        }

        const {
          data: {
            publicUrl,
          },
        } = supabase.storage
          .from("documents")
          .getPublicUrl(
            filePath
          );

        const title =
          file.name.replace(
            /\.[^/.]+$/,
            ""
          );

        await supabase
          .from("documents")
          .insert({
            title,

            description: "",

            folder_id:
              folderId ||
              null,

            file_url:
              publicUrl,

            file_name:
              file.name,

            file_size:
              file.size,

            file_type:
              file.type,
          });

        setUploaded(i + 1);
      }

      alert(
        "Upload hoàn tất"
      );

      router.push(
        "/admin/documents"
      );

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Folder */}
      <div className="bg-white p-6 rounded-3xl shadow">
        <label className="font-semibold flex items-center gap-2 mb-3">
          <Folder size={18} />
          Thư mục
        </label>

        <select
          value={folderId}
          onChange={(e) =>
            setFolderId(
              e.target.value
            )
          }
          className="
            w-full
            border
            rounded-xl
            px-4
            py-3
          "
        >
          <option value="">
            Không chọn
          </option>

          {folders.map(
            (folder) => (
              <option
                key={
                  folder.id
                }
                value={
                  folder.id
                }
              >
                {
                  folder.name
                }
              </option>
            )
          )}
        </select>
      </div>

      {/* Upload */}
      <label
        className="
          block
          bg-white
          rounded-3xl
          border-2
          border-dashed
          border-slate-300
          p-16
          text-center
          cursor-pointer
          hover:bg-slate-50
        "
      >
        <input
          hidden
          multiple
          type="file"
          onChange={(e) =>
            setFiles(
              Array.from(
                e.target
                  .files || []
              )
            )
          }
        />

        <UploadCloud
          size={60}
          className="mx-auto mb-4"
        />

        <h2 className="text-xl font-bold">
          Chọn nhiều file
        </h2>

        <p className="text-slate-500">
          PDF, DOCX, PPTX...
        </p>
      </label>

      {/* Preview */}
      {files.length > 0 && (
        <div className="bg-white rounded-3xl shadow p-6">
          <h2 className="font-bold mb-4">
            Danh sách file (
            {files.length})
          </h2>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {files.map(
              (file) => (
                <div
                  key={
                    file.name
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    p-3
                  "
                >
                  <FileText
                    size={
                      18
                    }
                  />

                  <div>
                    <div className="font-medium">
                      {
                        file.name
                      }
                    </div>

                    <div className="text-sm text-slate-500">
                      Title:
                      {" "}
                      {file.name.replace(
                        /\.[^/.]+$/,
                        ""
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Progress */}
      {loading && (
        <div className="bg-white p-6 rounded-3xl shadow">
          <p>
            Đã upload{" "}
            {uploaded}/
            {files.length}
          </p>

          <div className="w-full bg-slate-200 rounded-full h-3 mt-3">
            <div
              className="bg-blue-600 h-3 rounded-full"
              style={{
                width: `${
                  (uploaded /
                    files.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      )}

      <button
        onClick={uploadAll}
        disabled={loading}
        className="
          w-full
          bg-blue-600
          text-white
          py-4
          rounded-2xl
          font-semibold
        "
      >
        {loading
          ? "Đang upload..."
          : `Upload ${files.length} file`}
      </button>
    </div>
  );
}