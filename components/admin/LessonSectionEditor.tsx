"use client";

import { ArrowDown, ArrowUp, ClipboardList, GripVertical, Plus, Trash2, Video } from "lucide-react";

type LessonSection = {
  id?: string;
  title: string;
  video_url: string;
  position: number;
  exam_id?: string | null;
};

type ExamItem = {
  id: string;
  title: string;
};

interface Props {
  sections: LessonSection[];
  onChange: (sections: LessonSection[]) => void;
  exams?: ExamItem[];
}

function normalizePositions(sections: LessonSection[]) {
  return sections.map((section, index) => ({
    ...section,
    position: index + 1,
  }));
}

export default function LessonSectionEditor({
  sections,
  onChange,
  exams = [],
}: Props) {
  function updateSection(index: number, patch: Partial<LessonSection>) {
    const next = sections.map((section, currentIndex) =>
      currentIndex === index ? { ...section, ...patch } : section
    );
    onChange(next);
  }

  function addSection() {
    onChange(
      normalizePositions([
        ...sections,
        {
          title: "",
          video_url: "",
          position: sections.length + 1,
          exam_id: null,
        },
      ])
    );
  }

  function addExamSection() {
    onChange(
      normalizePositions([
        ...sections,
        {
          title: "",
          video_url: "",
          position: sections.length + 1,
          exam_id: exams[0]?.id || null,
        },
      ])
    );
  }

  function removeSection(index: number) {
    const next = sections.filter((_, currentIndex) => currentIndex !== index);
    onChange(normalizePositions(next));
  }

  function moveSection(index: number, direction: "up" | "down") {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sections.length) {
      return;
    }

    const next = [...sections];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(normalizePositions(next));
  }

  return (
    <div className="space-y-4">
      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          Chưa có tiết học. Video sẽ dùng video của bài học.
        </div>
      ) : (
        sections.map((section, index) => (
          <div key={`${index}-${section.position}`} className="rounded-2xl border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <GripVertical size={18} className="text-slate-400" />
                <div className="font-semibold">
                  {section.exam_id && !section.video_url ? "Bài thi" : "Tiết"} {section.position}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveSection(index, "up")}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(index, "down")}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  <Trash2 size={16} />
                  Xóa
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={section.title}
                onChange={(e) => updateSection(index, { title: e.target.value })}
                placeholder={section.exam_id && !section.video_url ? "Tên bài thi trong danh sách" : "Tên tiết học"}
                className="w-full rounded-xl border px-4 py-3"
              />

              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
                Vị trí hiện tại: {section.position}
              </div>
            </div>

            <input
              value={section.video_url}
              onChange={(e) => updateSection(index, { video_url: e.target.value })}
              placeholder="Link video tiết học"
              className="mt-3 w-full rounded-xl border px-4 py-3"
            />

            <select
              value={section.exam_id || ""}
              onChange={(e) => updateSection(index, { exam_id: e.target.value || null })}
              className="mt-3 w-full rounded-xl border px-4 py-3"
            >
              <option value="">Không gắn thi online</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>
        ))
      )}

      <button
        type="button"
        onClick={addSection}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium hover:bg-slate-200"
      >
        <Video size={16} />
        Thêm tiết học
      </button>
      <button
        type="button"
        onClick={addExamSection}
        className="ml-3 inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-medium text-emerald-800 hover:bg-emerald-200"
      >
        <ClipboardList size={16} />
        Thêm bài thi
      </button>
    </div>
  );
}
