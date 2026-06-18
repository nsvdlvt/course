"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, FileText } from "lucide-react";

import { supabase } from "@/lib/supabase";

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

type LessonRecord = {
  id: string;
  title: string;
  chapter_id: string | null;
};

export default function DocumentsPage({ params }: PageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lesson, setLesson] = useState<LessonRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const resolved = await params;
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Bạn chưa đăng nhập.");
        }

        const { data: lessonRow, error: lessonError } = await supabase
          .from("lessons")
          .select("*")
          .eq("slug", resolved.lessonSlug)
          .single();

        if (lessonError || !lessonRow) {
          throw new Error("Không tìm thấy bài học");
        }

        const { data: chapter } = await supabase
          .from("chapters")
          .select("course_id")
          .eq("id", lessonRow.chapter_id)
          .single();

        if (!chapter?.course_id) {
          throw new Error("Không tìm thấy khóa học của bài học này");
        }

        const { data: accessRows, error: accessError } = await supabase
          .from("user_courses")
          .select("course_id")
          .eq("user_id", user.id)
          .eq("course_id", chapter.course_id);

        if (accessError) {
          throw accessError;
        }

        if (!accessRows || accessRows.length === 0) {
          throw new Error("Bạn không có quyền xem tài liệu của bài học này");
        }

        const { data: lessonDocuments, error: lessonDocumentsError } = await supabase
          .from("lesson_documents")
          .select(
            `
              documents(*)
            `
          )
          .eq("lesson_id", lessonRow.id);

        if (lessonDocumentsError) {
          throw lessonDocumentsError;
        }

        const nextDocuments = ((lessonDocuments || []) as LessonDocument[]).flatMap((item) => {
          if (!item.documents) {
            return [];
          }

          return Array.isArray(item.documents) ? item.documents : [item.documents];
        });

        if (!mounted) return;
        setLesson(lessonRow as LessonRecord);
        setDocuments(nextDocuments);
      } catch (loadError) {
        if (!mounted) return;
        setLesson(null);
        setDocuments([]);
        setError(loadError instanceof Error ? loadError.message : "Không tải được tài liệu");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [params]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="text-lg font-semibold text-slate-600">Đang tải tài liệu...</div>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="p-10">{error || "Không tìm thấy bài học"}</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-2 text-5xl font-black">{lesson.title}</h1>
      <p className="mb-8 text-slate-500">Tài liệu bài học</p>

      {documents.length === 0 ? (
        <div className="text-slate-500">Chưa có tài liệu</div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="flex items-center justify-between rounded-2xl border p-5 hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <FileText />

                <div>
                  <div className="font-semibold">{doc.title}</div>
                  <div className="text-sm text-slate-500">{doc.file_name}</div>
                </div>
              </div>

              <Eye />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
