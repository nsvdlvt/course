export type CourseStructureNodeType = "folder" | "lesson" | "exam";

export interface LessonRecord {
  id: string;
  slug: string | null;
  title: string;
  description?: string | null;
  video_url?: string | null;
  position?: number | null;
  chapter_id?: string | null;
}

export interface ExamRecord {
  id: string;
  slug: string | null;
  title: string;
  description?: string | null;
  lesson_id?: string | null;
  exam_type?: string | null;
}

export interface ChapterRecord {
  id: string;
  title: string;
  position?: number | null;
}

export interface CourseStructureNode {
  id: string;
  type: CourseStructureNodeType;
  title: string;
  lessonId?: string | null;
  lessonSlug?: string | null;
  examId?: string | null;
  examSlug?: string | null;
  children?: CourseStructureNode[];
}

function createNodeId(prefix: string, value: string) {
  return `${prefix}-${value}`;
}

function normalizeNode(rawNode: unknown): CourseStructureNode | null {
  if (!rawNode || typeof rawNode !== "object") {
    return null;
  }

  const source = rawNode as Record<string, unknown>;
  const type =
    source.type === "lesson" || source.type === "exam" ? source.type : "folder";
  const title =
    typeof source.title === "string" && source.title.trim()
      ? source.title.trim()
      : type === "lesson"
        ? "Bài học"
        : type === "exam"
          ? "Bài thi"
        : "Thư mục";

  const id =
    typeof source.id === "string" && source.id.trim()
      ? source.id
      : createNodeId(type, Math.random().toString(36).slice(2));

  if (type === "lesson") {
    return {
      id,
      type,
      title,
      lessonId: typeof source.lessonId === "string" ? source.lessonId : null,
      lessonSlug: typeof source.lessonSlug === "string" ? source.lessonSlug : null,
      children: [],
    };
  }

  if (type === "exam") {
    return {
      id,
      type,
      title,
      examId: typeof source.examId === "string" ? source.examId : null,
      examSlug: typeof source.examSlug === "string" ? source.examSlug : null,
      children: [],
    };
  }

  const children = Array.isArray(source.children)
    ? source.children.map(normalizeNode).filter((node): node is CourseStructureNode => node !== null)
    : [];

  return {
    id,
    type,
    title,
    children,
  };
}

export function normalizeCourseStructure(rawStructure: unknown): CourseStructureNode[] {
  if (!Array.isArray(rawStructure)) {
    return [];
  }

  return rawStructure.map(normalizeNode).filter((node): node is CourseStructureNode => node !== null);
}

export function buildLegacyCourseStructure(
  chapters: ChapterRecord[],
  lessonsByChapterId: Record<string, LessonRecord[]>
): CourseStructureNode[] {
  return chapters.map((chapter) => ({
    id: createNodeId("chapter", chapter.id),
    type: "folder",
    title: chapter.title,
    children: (lessonsByChapterId[chapter.id] || []).map((lesson) => ({
      id: createNodeId("lesson", lesson.id),
      type: "lesson",
      title: lesson.title,
      lessonId: lesson.id,
      lessonSlug: lesson.slug,
      children: [],
    })),
  }));
}

export function getCourseStructure(
  rawStructure: unknown,
  chapters: ChapterRecord[],
  lessonsByChapterId: Record<string, LessonRecord[]>
) {
  const normalized = normalizeCourseStructure(rawStructure);
  if (normalized.length > 0) {
    return normalized;
  }

  return buildLegacyCourseStructure(chapters, lessonsByChapterId);
}

export function countStructureStats(nodes: CourseStructureNode[]) {
  let folderCount = 0;
  let lessonCount = 0;

  const visit = (items: CourseStructureNode[]) => {
    for (const item of items) {
      if (item.type === "folder") {
        folderCount += 1;
        visit(item.children || []);
      } else {
        lessonCount += 1;
      }
    }
  };

  visit(nodes);

  return { folderCount, lessonCount };
}
