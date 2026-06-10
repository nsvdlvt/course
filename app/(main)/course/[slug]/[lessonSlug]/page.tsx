import { supabase } from "@/lib/supabase";
import {
  BookOpen,
  Download,
  FileText,
  PlayCircle,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    slug: string;
    lessonSlug: string;
  }>;
}

type LessonDocument = {
  id: string;
  title: string;
  file_url: string;
  file_name: string | null;
};

type LessonDocumentLink = {
  document_id: string;
  documents: LessonDocument | null;
};

function getYoutubeEmbed(
  url: string
) {
  if (!url) return "";

  try {
    const parsed =
      new URL(url);

    if (
      parsed.hostname ===
      "youtu.be"
    ) {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }

    if (
      parsed.pathname.startsWith(
        "/embed/"
      )
    ) {
      return `https://www.youtube.com${parsed.pathname}`;
    }

    if (
      parsed.pathname.startsWith(
        "/shorts/"
      )
    ) {
      const videoId =
        parsed.pathname.split(
          "/"
        )[2];

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : "";
    }

    const videoId =
      parsed.searchParams.get(
        "v"
      );

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return "";
  } catch {
    return "";
  }
}

export default async function LessonPage({
  params,
}: PageProps) {
  const {
    lessonSlug,
  } = await params;

  const { data: lesson } =
    await supabase
      .from("lessons")
      .select("*")
      .eq("slug", lessonSlug)
      .single();

  if (!lesson) {
    return (
      <div className="p-10">
        Không tìm thấy bài học
      </div>
    );
  }

  const {
    data: lessonDocuments,
  } = await supabase
    .from("lesson_documents")
    .select(`
      document_id,
      documents(*)
    `)
    .eq(
      "lesson_id",
      lesson.id
    );

  const documents =
    (
      (lessonDocuments ||
        []) as LessonDocumentLink[]
    )
      .map(
        (item) => item.documents
      )
      .filter(
        (
          document
        ): document is LessonDocument =>
          Boolean(document)
      );

  const embedUrl =
    getYoutubeEmbed(
      lesson.video_url || ""
    );

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* TITLE */}
      <h1
        className="
          text-4xl
          md:text-5xl
          mt-8
          font-black
          text-slate-800
          mb-8
        "
      >
        {lesson.title}
      </h1>

      <div className="mb-8 overflow-hidden rounded-3xl bg-slate-950 shadow-lg">
        {embedUrl ? (
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full min-h-[220px] flex-col items-center justify-center px-6 text-center text-white">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <PlayCircle
                size={34}
                className="text-white"
              />
            </div>

            <h2 className="text-xl font-bold sm:text-2xl">
              Video đang được cập nhật
            </h2>
          </div>
        )}
      </div>

      {/* DOCUMENTS */}
      <section
        className="
          bg-white
          rounded-3xl
          border
          border-slate-200
          shadow-sm
          p-6
        "
      >
        <div className="flex items-center gap-3 mb-6">
          <BookOpen
            size={28}
          />

          <h2
            className="
              text-3xl
              font-bold
            "
          >
            Tài liệu bài học
          </h2>
        </div>

        {documents.length ===
        0 ? (
          <div
            className="
              py-12
              text-center
              text-slate-500
            "
          >
            Chưa có tài liệu
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map(
              (doc) => (
                <a
                  key={doc.id}
                  href={
                    doc.file_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
                    flex
                    items-center
                    justify-between

                    rounded-2xl
                    border
                    border-slate-200

                    p-5

                    hover:bg-slate-50
                    transition
                  "
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="
                        h-12
                        w-12

                        rounded-xl

                        bg-blue-100

                        flex
                        items-center
                        justify-center
                      "
                    >
                      <FileText
                        size={22}
                        className="
                          text-blue-600
                        "
                      />
                    </div>

                    <div>
                      <div
                        className="
                          font-semibold
                          text-lg
                        "
                      >
                        {doc.title}
                      </div>

                      <div
                        className="
                          text-slate-500
                        "
                      >
                        {
                          doc.file_name
                        }
                      </div>
                    </div>
                  </div>

                  <Download
                    size={22}
                    className="
                      text-slate-400
                    "
                  />
                </a>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}
