"use client";

import { useEffect, useState } from "react";

import LessonPlayer from "@/components/LessonPlayer";
import { supabase } from "@/lib/supabase";

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
  documents: LessonDocument | LessonDocument[] | null;
};

type LessonSection = {
  id: string;
  title: string;
  video_url: string | null;
  position: number;
  exam?: {
    id: string;
    title: string;
    slug: string;
    duration_minutes: number | null;
    question_count: number | null;
  } | null;
};

type LessonRecord = {
  id: string;
  title: string;
  chapter_id: string | null;
  video_url: string | null;
};

export default function LessonPage({ params }: PageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lesson, setLesson] = useState<LessonRecord | null>(null);
  const [sections, setSections] = useState<LessonSection[]>([]);
  const [documents, setDocuments] = useState<LessonDocument[]>([]);

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
          throw new Error("Bạn không có quyền xem bài học này");
        }

        const { data: lessonDocuments, error: lessonDocumentsError } = await supabase
          .from("lesson_documents")
          .select(
            `
              document_id,
              documents(*)
            `
          )
          .eq("lesson_id", lessonRow.id);

        if (lessonDocumentsError) {
          throw lessonDocumentsError;
        }

        const { data: sectionRows, error: sectionsError } = await supabase
          .from("lesson_sections")
          .select("*")
          .eq("lesson_id", lessonRow.id)
          .order("position");

        if (sectionsError) {
          throw sectionsError;
        }

        const sectionIds = (sectionRows || []).map((section) => section.id);
        const { data: sectionExams, error: examsError } = sectionIds.length
          ? await supabase
              .from("exams")
              .select("id,title,slug,duration_minutes,question_count,lesson_section_id")
              .in("lesson_section_id", sectionIds)
          : { data: [], error: null };

        if (examsError) {
          throw examsError;
        }

        const nextDocuments = ((lessonDocuments || []) as LessonDocumentLink[]).flatMap((item) => {
          if (!item.documents) {
            return [];
          }

          return Array.isArray(item.documents) ? item.documents : [item.documents];
        });

        const examBySectionId = new Map(
          ((sectionExams || []) as Array<{
            id: string;
            title: string;
            slug: string;
            duration_minutes: number | null;
            question_count: number | null;
            lesson_section_id: string | null;
          }>).map((exam) => [exam.lesson_section_id || "", exam])
        );

        const nextSections = ((sectionRows || []) as LessonSection[]).map((section) => ({
          ...section,
          exam: examBySectionId.get(section.id) || null,
        }));

        if (!mounted) return;
        setLesson(lessonRow as LessonRecord);
        setSections(nextSections);
        setDocuments(nextDocuments);
      } catch (loadError) {
        if (!mounted) return;
        setLesson(null);
        setSections([]);
        setDocuments([]);
        setError(loadError instanceof Error ? loadError.message : "Không tải được bài học");
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
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="text-lg font-semibold text-slate-600">Đang tải bài học...</div>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="p-10">{error || "Không tìm thấy bài học"}</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-6 mt-4 text-4xl font-black text-slate-800 md:text-5xl">{lesson.title}</h1>
      <LessonPlayer lesson={lesson} sections={sections} documents={documents} />
    </main>
  );
}
