"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, X } from "lucide-react";

import { supabase } from "@/lib/supabase";

interface DocumentDeleteButtonProps {
  documentId: string;
  fileUrl: string | null;
  variant?: "solid" | "ghost";
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

export default function DocumentDeleteButton({
  documentId,
  fileUrl,
  variant = "ghost",
}: DocumentDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function deleteDocument() {
    try {
      setDeleting(true);

      await supabase
        .from("lesson_documents")
        .delete()
        .eq("document_id", documentId);

      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (error) {
        throw error;
      }

      const oldPath = getStoragePath(fileUrl);

      if (oldPath) {
        await supabase.storage.from("documents").remove([oldPath]);
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Khong the xoa tai lieu");
    } finally {
      setDeleting(false);
    }
  }

  const buttonClassName =
    variant === "solid"
      ? "inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-medium text-white hover:bg-red-600 disabled:opacity-60"
      : "inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 font-medium text-red-600 hover:bg-red-100 disabled:opacity-60";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          disabled={deleting}
          className={buttonClassName}
        >
          <Trash2 size={variant === "solid" ? 18 : 16} />
          Xoa
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-black text-slate-900">
                Xoa tai lieu?
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-slate-600">
                Tai lieu se bi go khoi cac bai hoc dang dinh kem va xoa khoi danh sach.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Dong"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-xl bg-slate-100 px-5 py-3 font-medium text-slate-700 hover:bg-slate-200"
              >
                Huy
              </button>
            </Dialog.Close>

            <button
              type="button"
              onClick={deleteDocument}
              disabled={deleting}
              className="rounded-xl bg-red-500 px-5 py-3 font-medium text-white hover:bg-red-600 disabled:opacity-60"
            >
              {deleting ? "Dang xoa..." : "Xac nhan xoa"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
