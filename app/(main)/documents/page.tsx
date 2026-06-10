import Link from "next/link";
import {
  Download,
  Eye,
  FileText,
  Search,
  SearchX,
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
  searchParams: Promise<{
    q?: string | string[];
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

function getFileLabel(document: DocumentItem) {
  if (document.file_type) {
    return document.file_type.split("/").pop()?.toUpperCase() || "FILE";
  }

  const extension = document.file_name?.split(".").pop();

  return extension ? extension.toUpperCase() : "FILE";
}

function getDownloadUrl(document: DocumentItem) {
  try {
    const url = new URL(document.file_url);

    url.searchParams.set(
      "download",
      document.file_name || document.title
    );

    return url.toString();
  } catch {
    return document.file_url;
  }
}

function getSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() || "";
  }

  return value?.trim() || "";
}

export default async function DocumentsPage({
  searchParams,
}: PageProps) {
  const query = getSearchValue((await searchParams).q);

  let documentQuery = supabase
    .from("documents")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (query) {
    const escapedQuery = query.replace(/[%_,]/g, "\\$&");

    documentQuery = documentQuery.or(
      `title.ilike.%${escapedQuery}%,file_name.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%`
    );
  }

  const { data: documents } = await documentQuery;

  const items = (documents || []) as DocumentItem[];

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-fuchsia-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
              Thư viện học tập
            </p>

            <h1 className="text-4xl font-black text-slate-900 sm:text-5xl">
              Tài liệu
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Xem trước tài liệu và tải file về máy để học bất cứ lúc nào.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <form
              action="/documents"
              className="flex w-full gap-2 sm:w-[380px]"
            >
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Tìm tài liệu..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Search size={17} />
                Search
              </button>
            </form>

            <div className="rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm">
              {query
                ? `${items.length} kết quả`
                : `${items.length} tài liệu`}
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <SearchX
              size={44}
              className="mx-auto mb-4 text-slate-400"
            />

            <h2 className="text-xl font-bold text-slate-800">
              {query ? "Không tìm thấy tài liệu" : "Chưa có tài liệu"}
            </h2>

            <p className="mt-2 text-slate-500">
              {query
                ? "Thử tìm bằng tên file hoặc tiêu đề khác nhé."
                : "Khi admin upload tài liệu, chúng sẽ xuất hiện ở đây."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((document) => (
              <article
                key={document.id}
                className="group relative flex min-h-52 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <Link
                  href={`/documents/${document.id}`}
                  className="absolute inset-0 z-10 rounded-2xl"
                  aria-label={`Xem ${document.title}`}
                />

                <div>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <FileText size={24} />
                    </div>

                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {getFileLabel(document)}
                    </span>
                  </div>

                  <h2 className="line-clamp-2 text-lg font-bold text-slate-900">
                    {document.title}
                  </h2>

                  {document.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {document.description}
                    </p>
                  ) : (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {document.file_name}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <div className="mb-4 flex items-center justify-between gap-4 text-sm text-slate-500">
                    <span className="truncate">
                      {document.file_name || "Tài liệu"}
                    </span>

                    <span className="shrink-0">
                      {formatFileSize(document.file_size)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-blue-700"
                    >
                      <Eye size={17} />
                      Xem
                    </div>

                    <a
                      href={getDownloadUrl(document)}
                      download
                      className="relative z-20 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      aria-label={`Tải ${document.title}`}
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
