"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Folder,
  FileText,
} from "lucide-react";

interface Props {
  documents: any[];
  folders: any[];
  selectedIds: string[];
  onChange: (
    ids: string[]
  ) => void;
}

export default function DocumentPicker({
  documents,
  folders,
  selectedIds,
  onChange,
}: Props) {
  const [open, setOpen] =
    useState(false);

  const [keyword, setKeyword] =
    useState("");

  const [selectedFolder, setSelectedFolder] =
    useState<string>("all");

  function toggleDocument(
    id: string
  ) {
    if (
      selectedIds.includes(id)
    ) {
      onChange(
        selectedIds.filter(
          (x) => x !== id
        )
      );
      return;
    }

    onChange([
      ...selectedIds,
      id,
    ]);
  }

  const filteredDocs =
    useMemo(() => {
      return documents.filter(
        (doc) => {
          const matchKeyword =
            doc.title
              ?.toLowerCase()
              .includes(
                keyword.toLowerCase()
              );

          const matchFolder =
            selectedFolder ===
            "all"
              ? true
              : doc.folder_id ===
                selectedFolder;

          return (
            matchKeyword &&
            matchFolder
          );
        }
      );
    }, [
      documents,
      keyword,
      selectedFolder,
    ]);

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="
          rounded-xl
          bg-blue-600
          px-4
          py-2
          text-white
          hover:bg-blue-700
        "
      >
        Chọn tài liệu
      </button>

      {open && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/50
            flex
            items-center
            justify-center
          "
        >
          <div
            className="
              w-[95vw]
              max-w-[1400px]
              h-[85vh]

              bg-white
              rounded-3xl
              shadow-2xl
              overflow-hidden

              flex
            "
          >
            {/* Sidebar */}
            <div
              className="
                w-[300px]
                border-r
                bg-slate-50
                p-5
              "
            >
              <h3 className="font-bold text-lg mb-4">
                Thư mục
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() =>
                    setSelectedFolder(
                      "all"
                    )
                  }
                  className={`
                    w-full
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    px-3
                    py-3
                    text-left

                    ${
                      selectedFolder ===
                      "all"
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-200"
                    }
                  `}
                >
                  <Folder size={18} />
                  Tất cả
                </button>

                {folders.map(
                  (folder) => (
                    <button
                      key={
                        folder.id
                      }
                      onClick={() =>
                        setSelectedFolder(
                          folder.id
                        )
                      }
                      className={`
                        w-full
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        px-3
                        py-3
                        text-left

                        ${
                          selectedFolder ===
                          folder.id
                            ? "bg-blue-600 text-white"
                            : "hover:bg-slate-200"
                        }
                      `}
                    >
                      <Folder
                        size={18}
                      />

                      {
                        folder.name
                      }
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">
                  Chọn tài liệu
                </h2>

                <p className="text-slate-500 mt-1">
                  Chọn tài
                  liệu để gắn
                  vào bài học
                </p>
              </div>

              {/* Search */}
              <div className="p-6 border-b">
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    border
                    rounded-xl
                    px-4
                    py-3
                  "
                >
                  <Search
                    size={18}
                  />

                  <input
                    value={
                      keyword
                    }
                    onChange={(
                      e
                    ) =>
                      setKeyword(
                        e.target
                          .value
                      )
                    }
                    placeholder="Tìm tài liệu..."
                    className="
                      flex-1
                      outline-none
                    "
                  />
                </div>
              </div>

              {/* Files */}
              <div
                className="
                  flex-1
                  overflow-y-auto
                  p-6
                "
              >
                <div
                  className="
                    grid
                    grid-cols-2
                    xl:grid-cols-3
                    gap-3
                  "
                >
                  {filteredDocs.length ===
                  0 ? (
                    <div
                      className="
                        col-span-full
                        flex
                        items-center
                        justify-center
                        h-64
                        text-slate-500
                      "
                    >
                      Không có
                      tài liệu
                    </div>
                  ) : (
                    filteredDocs.map(
                      (doc) => (
                        <label
                          key={
                            doc.id
                          }
                          className="
                            flex
                            items-center
                            gap-3
                            p-4
                            rounded-xl
                            border
                            hover:bg-slate-50
                            cursor-pointer
                          "
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(
                              doc.id
                            )}
                            onChange={() =>
                              toggleDocument(
                                doc.id
                              )
                            }
                          />

                          <FileText
                            size={
                              20
                            }
                          />

                          <div>
                            <div className="font-medium">
                              {
                                doc.title
                              }
                            </div>

                            <div className="text-sm text-slate-500">
                              {
                                doc.file_name
                              }
                            </div>
                          </div>
                        </label>
                      )
                    )
                  )}
                </div>
              </div>

              {/* Footer */}
              <div
                className="
                  border-t
                  p-4
                  flex
                  justify-end
                  gap-3
                "
              >
                <button
                  onClick={() =>
                    setOpen(
                      false
                    )
                  }
                  className="
                    px-5
                    py-2
                    rounded-xl
                    border
                  "
                >
                  Hủy
                </button>

                <button
                  onClick={() =>
                    setOpen(
                      false
                    )
                  }
                  className="
                    px-5
                    py-2
                    rounded-xl
                    bg-blue-600
                    text-white
                  "
                >
                  Chọn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}