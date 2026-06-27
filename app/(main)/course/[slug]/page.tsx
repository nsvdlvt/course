"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, FolderTree, PlayCircle } from "lucide-react";

import BackButton from "@/components/BackButton";
import ChapterAccordion from "@/components/ChapterAccordion";
import { countStructureStats, getCourseStructure, type CourseStructureNode } from "@/lib/course-structure";
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

type CourseRecord = {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  description: string | null;
  course_structure: unknown;
};

type ChapterRecord = {
  id: string;
  title: string;
  position: number;
};

type LessonRecord = {
  id: string;
  title: string;
  slug: string | null;
  chapter_id: string | null;
  position: number | null;
};

function StructureTree({
  nodes,
  courseSlug,
  depth = 0,
}: {
  nodes: CourseStructureNode[];
  courseSlug: string;
  depth?: number;
}) {
  return (
    <div className="space-y-4">
      {nodes.map((node) =>
        node.type === "folder" ? (
          <ChapterAccordion
            key={node.id}
            title={node.title}
            subtitle={`${(node.children || []).length} mục con`}
            defaultOpen={false}
            variant={depth === 0 ? "root" : "nested"}
          >
            {(node.children || []).length > 0 ? (
              <StructureTree nodes={node.children || []} courseSlug={courseSlug} depth={depth + 1} />
            ) : (
              <div className="px-6 py-4 text-slate-500">Thư mục này chưa có nội dung</div>
            )}
          </ChapterAccordion>
        ) : (
          <Link
            key={node.id}
            href={
              node.type === "lesson"
                ? node.lessonSlug
                  ? `/course/${courseSlug}/${node.lessonSlug}`
                  : "#"
                : node.examSlug
                  ? `/exam/${node.examSlug}`
                  : "#"
            }
            className={[
              "flex items-center justify-between rounded-3xl border px-6 py-4 transition-colors duration-200",
              depth > 0
                ? "border-cyan-100 bg-white hover:bg-cyan-50/60"
                : "border-slate-200 bg-white hover:bg-slate-50",
            ].join(" ")}
          >
            <div className="flex items-center gap-3">
              {node.type === "lesson" ? (
                <PlayCircle size={20} className={depth > 0 ? "text-cyan-600" : "text-blue-600"} />
              ) : (
                <FileText size={20} className={depth > 0 ? "text-teal-600" : "text-emerald-600"} />
              )}
              <span className={depth > 0 ? "text-[15px] font-medium text-slate-700" : "font-medium text-slate-800"}>
                {node.title}
              </span>
            </div>
          </Link>
        )
      )}
    </div>
  );
}

export default function CoursePage({ params }: PageProps) {
  const [slug, setSlug] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [structure, setStructure] = useState<CourseStructureNode[]>([]);
  const [stats, setStats] = useState({ folderCount: 0, lessonCount: 0 });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const resolved = await params;
        if (!mounted) return;
        setSlug(resolved.slug);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!mounted) return;
          setError("Bạn chưa đăng nhập.");
          return;
        }

        const { data: courseRow, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("slug", resolved.slug)
          .single();

        if (courseError || !courseRow) {
          throw new Error("Không tìm thấy khóa học");
        }

        const { data: accessRows, error: accessError } = await supabase
          .from("user_courses")
          .select("course_id")
          .eq("user_id", user.id)
          .eq("course_id", courseRow.id);

        if (accessError) {
          throw accessError;
        }

        if (!accessRows || accessRows.length === 0) {
          throw new Error("Bạn không có quyền xem khóa học này");
        }

        const { data: chapters, error: chaptersError } = await supabase
          .from("chapters")
          .select("*")
          .eq("course_id", courseRow.id)
          .order("position");

        if (chaptersError) {
          throw chaptersError;
        }

        const chapterIds = (chapters || []).map((chapter) => chapter.id);

        const { data: lessons, error: lessonsError } = await supabase
          .from("lessons")
          .select("*")
          .in("chapter_id", chapterIds);

        if (lessonsError) {
          throw lessonsError;
        }

        const lessonsByChapterId = (lessons || []).reduce(
          (acc: Record<string, LessonRecord[]>, lesson) => {
            const chapterId = lesson.chapter_id;
            if (!chapterId) {
              return acc;
            }

            acc[chapterId] = [...(acc[chapterId] || []), lesson as LessonRecord];
            return acc;
          },
          {}
        );

        const nextStructure = getCourseStructure(
          courseRow.course_structure,
          (chapters || []) as ChapterRecord[],
          lessonsByChapterId
        );

        if (!mounted) return;
        setCourse(courseRow as CourseRecord);
        setStructure(nextStructure);
        setStats(countStructureStats(nextStructure));
      } catch (loadError) {
        if (!mounted) return;
        setCourse(null);
        setStructure([]);
        setStats({ folderCount: 0, lessonCount: 0 });
        setError(loadError instanceof Error ? loadError.message : "Không tải được khóa học");
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
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-lg font-semibold text-slate-600">Đang tải khóa học...</div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">{error || "Không tìm thấy khóa học"}</h1>
      </main>
    );
  }

  const courseImage = course.image ? `/${course.image}` : "/logo.png";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <BackButton href="/course" />

          <div className="mt-6 flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
              <Image
                src={courseImage}
                alt={course.title}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-5xl font-black text-slate-800">{course.title}</h1>
              <p className="mt-2 text-slate-500">
                {stats.folderCount} thư mục • {stats.lessonCount} bài học
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white/70 px-5 py-4 shadow-sm ring-1 ring-slate-200/70">
          <FolderTree size={20} className="text-cyan-700" />
          <p className="text-sm text-slate-600">
            Cấu trúc khóa học hỗ trợ dạng cây phân nhánh, có thể lồng thư mục, bài học và bài thi linh hoạt.
          </p>
        </div>

        <div className="space-y-5">
          <StructureTree nodes={structure} courseSlug={slug} />
        </div>
      </div>
    </main>
  );
}
