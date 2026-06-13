import { supabase } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type DocumentItem = {
  title: string;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
};

function getStoragePath(fileUrl: string) {
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

function getSafeFileName(document: DocumentItem) {
  return (document.file_name || document.title || "document")
    .replace(/[\r\n"]/g, "")
    .trim();
}

function getAsciiFileName(fileName: string) {
  const normalized = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/[\\/:*?"<>|]/g, "_")
    .trim();

  return normalized || "document";
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params;

  const { data: document } = await supabase
    .from("documents")
    .select("title,file_url,file_name,file_type")
    .eq("id", id)
    .single();

  if (!document) {
    return new Response("Not found", {
      status: 404,
    });
  }

  const item = document as DocumentItem;
  const storagePath = getStoragePath(item.file_url);

  if (!storagePath) {
    return Response.redirect(item.file_url, 302);
  }

  const { data: file, error } = await supabase.storage
    .from("documents")
    .download(storagePath);

  if (error || !file) {
    return Response.redirect(item.file_url, 302);
  }

  const fileName = getSafeFileName(item);
  const encodedFileName = encodeURIComponent(fileName);
  const asciiFileName = getAsciiFileName(fileName);
  const headers = new Headers({
    "Content-Disposition": `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`,
    "Content-Type": "application/octet-stream",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });

  if (file.size) {
    headers.set("Content-Length", String(file.size));
  }

  return new Response(file, {
    headers,
  });
}
