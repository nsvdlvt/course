"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  FilePlus2,
  FolderPlus,
  GripVertical,
  NotebookPen,
  Save,
  ScrollText,
  Trash2,
} from "lucide-react";

import type { CourseStructureNode, ExamRecord, LessonRecord } from "@/lib/course-structure";
import { supabase } from "@/lib/supabase";

interface Props {
  courseId: string;
  initialStructure: CourseStructureNode[];
  lessons: LessonRecord[];
  exams: ExamRecord[];
}

function createFolderNode(): CourseStructureNode {
  return {
    id: `folder-${Math.random().toString(36).slice(2)}`,
    type: "folder",
    title: "Mục mới",
    children: [],
  };
}

function createLessonNode(lesson?: LessonRecord): CourseStructureNode {
  return {
    id: `lesson-${Math.random().toString(36).slice(2)}`,
    type: "lesson",
    title: lesson?.title || "Bài học mới",
    lessonId: lesson?.id || null,
    lessonSlug: lesson?.slug || null,
    children: [],
  };
}

function createExamNode(exam?: ExamRecord): CourseStructureNode {
  return {
    id: `exam-${Math.random().toString(36).slice(2)}`,
    type: "exam",
    title: exam?.title || "Bài thi mới",
    examId: exam?.id || null,
    examSlug: exam?.slug || null,
    children: [],
  };
}

function updateNodeTree(
  nodes: CourseStructureNode[],
  targetId: string,
  updater: (node: CourseStructureNode) => CourseStructureNode
): CourseStructureNode[] {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return updater(node);
    }

    return {
      ...node,
      children: node.children ? updateNodeTree(node.children, targetId, updater) : [],
    };
  });
}

function removeNodeTree(nodes: CourseStructureNode[], targetId: string): CourseStructureNode[] {
  return nodes
    .filter((node) => node.id !== targetId)
    .map((node) => ({
      ...node,
      children: node.children ? removeNodeTree(node.children, targetId) : [],
    }));
}

function appendChildNode(nodes: CourseStructureNode[], parentId: string, child: CourseStructureNode) {
  return updateNodeTree(nodes, parentId, (node) => ({
    ...node,
    children: [...(node.children || []), child],
  }));
}

function moveNode(nodes: CourseStructureNode[], targetId: string, direction: "up" | "down"): CourseStructureNode[] {
  const reorder = (items: CourseStructureNode[]): CourseStructureNode[] => {
    const index = items.findIndex((item) => item.id === targetId);
    if (index !== -1) {
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= items.length) {
        return items;
      }

      const cloned = [...items];
      [cloned[index], cloned[nextIndex]] = [cloned[nextIndex], cloned[index]];
      return cloned;
    }

    return items.map((item) => ({
      ...item,
      children: item.children ? reorder(item.children) : [],
    }));
  };

  return reorder(nodes);
}

function collectAssignedIds(nodes: CourseStructureNode[], type: "lesson" | "exam"): string[] {
  return nodes.flatMap((node) => {
    if (node.type === type) {
      return type === "lesson"
        ? node.lessonId
          ? [node.lessonId]
          : []
        : node.examId
          ? [node.examId]
          : [];
    }

    return collectAssignedIds(node.children || [], type);
  });
}

function TreeNodeEditor({
  node,
  lessons,
  exams,
  openIds,
  onToggle,
  onChange,
  onRemove,
  onAddFolder,
  onAddLesson,
  onAddExam,
  onMove,
}: {
  node: CourseStructureNode;
  lessons: LessonRecord[];
  exams: ExamRecord[];
  openIds: Set<string>;
  onToggle: (id: string) => void;
  onChange: (nodeId: string, patch: Partial<CourseStructureNode>) => void;
  onRemove: (nodeId: string) => void;
  onAddFolder: (parentId: string) => void;
  onAddLesson: (parentId: string) => void;
  onAddExam: (parentId: string) => void;
  onMove: (nodeId: string, direction: "up" | "down") => void;
}) {
  const isFolder = node.type === "folder";
  const isOpen = openIds.has(node.id);
  const isLesson = node.type === "lesson";
  const isExam = node.type === "exam";

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 text-slate-400">
            <GripVertical size={18} />
            {isFolder ? (
              <button type="button" onClick={() => onToggle(node.id)} className="rounded-lg p-1 hover:bg-slate-100">
                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
            ) : isLesson ? (
              <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">Bài học</span>
            ) : (
              <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Bài thi</span>
            )}
          </div>

          <div className="grid flex-1 gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(220px,0.8fr)]">
            <input
              value={node.title}
              onChange={(event) => onChange(node.id, { title: event.target.value })}
              className="rounded-xl border px-4 py-3"
              placeholder={isFolder ? "Tên mục" : isLesson ? "Tên bài học" : "Tên bài thi"}
            />

            {isFolder ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
                Mục này có thể chứa mục con, bài học hoặc bài thi.
              </div>
            ) : isLesson ? (
              <select
                value={node.lessonId || ""}
                onChange={(event) => {
                  const lesson = lessons.find((item) => item.id === event.target.value);
                  onChange(node.id, {
                    lessonId: lesson?.id || null,
                    lessonSlug: lesson?.slug || null,
                    title: lesson?.title || node.title,
                  });
                }}
                className="rounded-xl border px-4 py-3"
              >
                <option value="">Chọn bài học liên kết</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={node.examId || ""}
                onChange={(event) => {
                  const exam = exams.find((item) => item.id === event.target.value);
                  onChange(node.id, {
                    examId: exam?.id || null,
                    examSlug: exam?.slug || null,
                    title: exam?.title || node.title,
                  });
                }}
                className="rounded-xl border px-4 py-3"
              >
                <option value="">Chọn bài thi liên kết</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => onMove(node.id, "up")} className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
              Lên
            </button>
            <button type="button" onClick={() => onMove(node.id, "down")} className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
              Xuống
            </button>
            {isFolder && (
              <>
                <button type="button" onClick={() => onAddFolder(node.id)} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                  <FolderPlus size={16} />
                  Mục con
                </button>
                <button type="button" onClick={() => onAddLesson(node.id)} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                  <NotebookPen size={16} />
                  Bài học
                </button>
                <button type="button" onClick={() => onAddExam(node.id)} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                  <ScrollText size={16} />
                  Bài thi
                </button>
              </>
            )}
            <button type="button" onClick={() => onRemove(node.id)} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100">
              <Trash2 size={16} />
              Xóa
            </button>
          </div>
        </div>
      </div>

      {isFolder && isOpen && (node.children || []).length > 0 && (
        <div className="ml-5 border-l-2 border-slate-200 pl-4">
          <div className="space-y-3">
            {(node.children || []).map((child) => (
              <TreeNodeEditor
                key={child.id}
                node={child}
                lessons={lessons}
                exams={exams}
                openIds={openIds}
                onToggle={onToggle}
                onChange={onChange}
                onRemove={onRemove}
                onAddFolder={onAddFolder}
                onAddLesson={onAddLesson}
                onAddExam={onAddExam}
                onMove={onMove}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CourseStructureEditor({ courseId, initialStructure, lessons, exams }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [structure, setStructure] = useState<CourseStructureNode[]>(initialStructure);
  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set(initialStructure.filter((node) => node.type === "folder").map((node) => node.id))
  );

  const assignedLessonIds = new Set(collectAssignedIds(structure, "lesson"));
  const assignedExamIds = new Set(collectAssignedIds(structure, "exam"));
  const unassignedLessons = lessons.filter((lesson) => !assignedLessonIds.has(lesson.id));
  const unassignedExams = exams.filter((exam) => !assignedExamIds.has(exam.id));

  function toggleOpen(id: string) {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function saveStructure() {
    try {
      setLoading(true);

      const { error } = await supabase.from("courses").update({ course_structure: structure }).eq("id", courseId);
      if (error) {
        alert(error.message);
        return;
      }

      alert("Da luu cau truc khoa hoc");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl bg-white p-6 shadow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cấu trúc khóa học</h2>
          <p className="mt-1 text-slate-500">Thêm mục, sau đó chèn bài học hoặc bài thi vào bên trong.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setStructure((current) => [...current, createFolderNode()])} className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 hover:bg-slate-50">
            <FolderPlus size={18} />
            Thêm mục gốc
          </button>
          <button type="button" onClick={() => setStructure((current) => [...current, createLessonNode(unassignedLessons[0])])} className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 hover:bg-slate-50">
            <FilePlus2 size={18} />
            Thêm bài học
          </button>
          <button type="button" onClick={() => setStructure((current) => [...current, createExamNode(unassignedExams[0])])} className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 hover:bg-slate-50">
            <ScrollText size={18} />
            Thêm bài thi
          </button>
          <button type="button" onClick={saveStructure} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white disabled:opacity-50">
            <Save size={18} />
            {loading ? "Đang lưu..." : "Lưu cấu trúc"}
          </button>
        </div>
      </div>

      {(unassignedLessons.length > 0 || unassignedExams.length > 0) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Còn {unassignedLessons.length} bài học và {unassignedExams.length} bài thi chưa được gắn vào cây.
        </div>
      )}

      <div className="space-y-4">
        {structure.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Chưa có node nào. Hãy tạo mục, bài học hoặc bài thi đầu tiên.
          </div>
        ) : (
          structure.map((node) => (
            <TreeNodeEditor
              key={node.id}
              node={node}
              lessons={lessons}
              exams={exams}
              openIds={openIds}
              onToggle={toggleOpen}
              onChange={(nodeId, patch) =>
                setStructure((current) =>
                  updateNodeTree(current, nodeId, (nodeItem) => ({
                    ...nodeItem,
                    ...patch,
                  }))
                )
              }
              onRemove={(nodeId) => setStructure((current) => removeNodeTree(current, nodeId))}
              onAddFolder={(parentId) => {
                setOpenIds((current) => new Set(current).add(parentId));
                setStructure((current) => appendChildNode(current, parentId, createFolderNode()));
              }}
              onAddLesson={(parentId) => {
                setOpenIds((current) => new Set(current).add(parentId));
                setStructure((current) => appendChildNode(current, parentId, createLessonNode(unassignedLessons[0])));
              }}
              onAddExam={(parentId) => {
                setOpenIds((current) => new Set(current).add(parentId));
                setStructure((current) => appendChildNode(current, parentId, createExamNode(unassignedExams[0])));
              }}
              onMove={(nodeId, direction) => setStructure((current) => moveNode(current, nodeId, direction))}
            />
          ))
        )}
      </div>
    </div>
  );
}
