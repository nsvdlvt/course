import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  FileText,
  Eye,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    slug: string;
    lessonSlug: string;
  }>;
}

type DocumentItem = {
  id: string;
  title: string;
  file_name: string | null;
};

type LessonDocument = {
  documents: DocumentItem | DocumentItem[] | null;
};

export default async function DocumentsPage({
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
      documents(*)
    `)
    .eq(
      "lesson_id",
      lesson.id
    );

  const documents =
    ((lessonDocuments || []) as LessonDocument[])
      .flatMap(
        (item) => {
          if (!item.documents) {
            return [];
          }

          return Array.isArray(item.documents)
            ? item.documents
            : [item.documents];
        }
      );

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-5xl font-black mb-2">
        {lesson.title}
      </h1>

      <p className="text-slate-500 mb-8">
        Tài liệu bài học
      </p>

      {documents.length ===
      0 ? (
        <div className="text-slate-500">
          Chưa có tài liệu
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map(
            (doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="
                  flex
                  items-center
                  justify-between

                  rounded-2xl
                  border

                  p-5

                  hover:bg-slate-50
                "
              >
                <div className="flex items-center gap-4">
                  <FileText />

                  <div>
                    <div className="font-semibold">
                      {doc.title}
                    </div>

                    <div className="text-sm text-slate-500">
                      {
                        doc.file_name
                      }
                    </div>
                  </div>
                </div>

                <Eye />
              </Link>
            )
          )}
        </div>
      )}
    </main>
  );
}
