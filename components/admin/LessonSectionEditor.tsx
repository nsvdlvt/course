"use client";

import { Plus, Trash2 } from "lucide-react";

type LessonSection = {
  id?: string;
  title: string;
  video_url: string;
  position: number;
};

interface Props {
  sections: LessonSection[];
  onChange: (sections: LessonSection[]) => void;
}

export default function LessonSectionEditor({
  sections,
  onChange,
}: Props) {
  function updateSection(
    index: number,
    patch: Partial<LessonSection>
  ) {
    const next = sections.map((section, currentIndex) =>
      currentIndex === index ? { ...section, ...patch } : section
    );
    onChange(next);
  }

  function addSection() {
    onChange([
      ...sections,
      {
        title: "",
        video_url: "",
        position: sections.length + 1,
      },
    ]);
  }

  function removeSection(index: number) {
    const next = sections.filter((_, currentIndex) => currentIndex !== index);
    onChange(
      next.map((section, currentIndex) => ({
        ...section,
        position: currentIndex + 1,
      }))
    );
  }

  return (
    <div className="space-y-4">
      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          Chua co tiet hoc. Video se dung video cua bai hoc.
        </div>
      ) : (
        sections.map((section, index) => (
          <div key={`${index}-${section.position}`} className="rounded-2xl border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="font-semibold">Tiet {section.position}</div>
              <button
                type="button"
                onClick={() => removeSection(index)}
                className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                <Trash2 size={16} />
                Xoa
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={section.title}
                onChange={(e) => updateSection(index, { title: e.target.value })}
                placeholder="Ten tiet hoc"
                className="w-full rounded-xl border px-4 py-3"
              />

              <input
                type="number"
                value={section.position}
                onChange={(e) =>
                  updateSection(index, { position: Number(e.target.value) || index + 1 })
                }
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <input
              value={section.video_url}
              onChange={(e) => updateSection(index, { video_url: e.target.value })}
              placeholder="Link video tiet hoc"
              className="mt-3 w-full rounded-xl border px-4 py-3"
            />
          </div>
        ))
      )}

      <button
        type="button"
        onClick={addSection}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium hover:bg-slate-200"
      >
        <Plus size={16} />
        Them tiet hoc
      </button>
    </div>
  );
}
