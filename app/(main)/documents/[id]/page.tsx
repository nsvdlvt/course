import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import {
  Download,
  ExternalLink,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type DocumentItem = {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  created_at: string | null;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatFileSize(size: number | null) {
  if (!size) return "Không rõ dung lượng";

  const mb = size / 1024 / 1024;

  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }

  return `${(size / 1024).toFixed(0)} KB`;
}

function getExtension(document: DocumentItem) {
  return document.file_name?.split(".").pop()?.toLowerCase() || "";
}

function getPreviewType(document: DocumentItem) {
  const fileType = document.file_type || "";
  const extension = getExtension(document);

  if (fileType === "application/pdf" || extension === "pdf") {
    return "pdf";
  }

  if (fileType.startsWith("image/")) {
    return "image";
  }

  if (fileType.startsWith("video/")) {
    return "video";
  }

  if (fileType.startsWith("audio/")) {
    return "audio";
  }

  return "file";
}

function getDownloadUrl(document: DocumentItem) {
  return `/api/documents/${document.id}/download`;
}

function FilePreview({
  document,
}: {
  document: DocumentItem;
}) {
  const previewType = getPreviewType(document);

  if (previewType === "pdf") {
    return (
      <>
        <div className="md:hidden">
          <PreviewFallback
            document={document}
            title="Mở PDF để xem đầy đủ"
            description="iPhone thường không cuộn ổn định PDF khi nhúng trực tiếp trong trang. Mở file riêng sẽ xem và lướt được toàn bộ tài liệu."
            openLabel="Xem PDF"
          />
        </div>

        <iframe
          src={document.file_url}
          title={document.title}
          className="hidden h-[75vh] min-h-[520px] w-full rounded-2xl border border-slate-200 bg-white md:block"
        />
      </>
    );
  }

  if (previewType === "image") {
    return (
      <object
        data={document.file_url}
        type={document.file_type || undefined}
        className="h-[70vh] min-h-[420px] w-full rounded-2xl border border-slate-200 bg-white object-contain"
      >
        <PreviewFallback document={document} />
      </object>
    );
  }

  if (previewType === "video") {
    return (
      <video
        controls
        className="h-auto max-h-[75vh] w-full rounded-2xl border border-slate-200 bg-black"
      >
        <source
          src={document.file_url}
          type={document.file_type || undefined}
        />
      </video>
    );
  }

  if (previewType === "audio") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <audio
          controls
          className="w-full"
        >
          <source
            src={document.file_url}
            type={document.file_type || undefined}
          />
        </audio>
      </div>
    );
  }

  return <PreviewFallback document={document} />;
}

function PreviewFallback({
  document,
  title = "Không thể preview trực tiếp file này",
  description = "Một số định dạng như DOCX, PPTX hoặc file nén cần tải về hoặc mở ở tab mới để xem đầy đủ.",
  openLabel = "Mở file",
}: {
  document: DocumentItem;
  title?: string;
  description?: string;
  openLabel?: string;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
        <FileText size={32} />
      </div>

      <h2 className="text-xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-2 max-w-lg text-slate-500">
        {description}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a
          href={document.file_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ExternalLink size={18} />
          {openLabel}
        </a>

        <a
          href={getDownloadUrl(document)}
          download
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <Download size={18} />
          Tải xuống
        </a>
      </div>
    </div>
  );
}

export default async function DocumentDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (!document) {
    notFound();
  }

  const item = document as DocumentItem;

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-fuchsia-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <BackButton />

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
                Xem tài liệu
              </p>

              <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
                {item.title}
              </h1>

              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                <span>{item.file_name || "Tài liệu"}</span>
                <span>{formatFileSize(item.file_size)}</span>
                {item.file_type && <span>{item.file_type}</span>}
              </div>

              {item.description && (
                <p className="mt-4 max-w-3xl text-slate-600">
                  {item.description}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <a
                href={item.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ExternalLink size={17} />
                Mở tab mới
              </a>

              <a
                href={getDownloadUrl(item)}
                download
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Download size={17} />
                Tải xuống
              </a>
            </div>
          </div>
        </section>

        <FilePreview document={item} />
      </div>
    </main>
  );
}
