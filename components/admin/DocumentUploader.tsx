"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Props {
  folders: any[];
}

export default function DocumentUploader({
  folders,
}: Props) {
  const router = useRouter();

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [folderId, setFolderId] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function uploadDocument() {
    if (!file) {
      alert("Vui lòng chọn file");
      return;
    }

    if (!title.trim()) {
      alert("Nhập tên tài liệu");
      return;
    }

    try {
      setLoading(true);

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

      const { error: uploadError } =
        await supabase.storage
          .from("documents")
          .upload(filePath, file);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const { error: dbError } =
        await supabase
          .from("documents")
          .insert({
            title,
            description,

            folder_id:
              folderId || null,

            file_url: publicUrl,

            file_name: file.name,

            file_size: file.size,

            file_type: file.type,
          });

      if (dbError) {
        alert(dbError.message);
        return;
      }

      alert(
        "Upload thành công"
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
    <div
      className="
        bg-white
        rounded-3xl
        shadow
        p-8
        space-y-6
      "
    >
      {/* Tên */}
      <div>
        <label className="block mb-2 font-medium">
          Tên tài liệu
        </label>

        <input
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
          placeholder="Ví dụ: Công thức Dao động"
          className="
            w-full
            border
            rounded-xl
            px-4
            py-3
          "
        />
      </div>

      {/* Mô tả */}
      <div>
        <label className="block mb-2 font-medium">
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
          placeholder="Mô tả tài liệu..."
          className="
            w-full
            border
            rounded-xl
            px-4
            py-3
          "
        />
      </div>

      {/* Folder */}
      <div>
        <label className="block mb-2 font-medium">
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
            Chọn thư mục
          </option>

          {folders.map(
            (folder) => (
              <option
                key={folder.id}
                value={folder.id}
              >
                {folder.name}
              </option>
            )
          )}
        </select>
      </div>

      {/* Upload */}
      <label
        className="
          block
          border-2
          border-dashed
          border-slate-300
          rounded-3xl
          p-10
          text-center
          cursor-pointer
          hover:bg-slate-50
          transition
        "
      >
        <input
          hidden
          type="file"
          onChange={(e) =>
            setFile(
              e.target.files?.[0] ||
                null
            )
          }
        />

        <div className="text-5xl mb-3">
          📄
        </div>

        <p className="font-semibold">
          Chọn hoặc kéo file vào đây
        </p>

        <p className="text-sm text-slate-500 mt-1">
          PDF, DOCX, PPTX...
        </p>
      </label>

      {/* Preview */}
      {file && (
        <div
          className="
            rounded-2xl
            bg-slate-100
            p-4
          "
        >
          <div className="font-semibold">
            {file.name}
          </div>

          <div className="text-sm text-slate-500">
            {(
              file.size /
              1024 /
              1024
            ).toFixed(2)}{" "}
            MB
          </div>
        </div>
      )}

      {/* Button */}
      <button
        onClick={uploadDocument}
        disabled={loading}
        className="
          w-full
          rounded-xl
          bg-blue-600
          py-3
          text-white
          font-medium
          hover:bg-blue-700
          disabled:opacity-60
        "
      >
        {loading
          ? "Đang upload..."
          : "Upload tài liệu"}
      </button>
    </div>
  );
}