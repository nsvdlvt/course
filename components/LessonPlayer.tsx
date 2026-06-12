"use client";

import { useMemo, useState } from "react";
import { BookOpen, FileText, Menu, PlayCircle, X } from "lucide-react";

type LessonDocument = {
  id: string;
  title: string;
  file_url: string;
  file_name: string | null;
};

type LessonSection = {
  id: string;
  title: string;
  video_url: string | null;
  position: number;
};

type Lesson = {
  id: string;
  title: string;
  video_url: string | null;
};

interface Props {
  lesson: Lesson;
  sections: LessonSection[];
  documents: LessonDocument[];
}

function getYoutubeEmbed(url: string) {
  if (!url) return "";

  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }

    if (parsed.pathname.startsWith("/embed/")) {
      return `https://www.youtube.com${parsed.pathname}`;
    }

    if (parsed.pathname.startsWith("/shorts/")) {
      const videoId = parsed.pathname.split("/")[2];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    const videoId = parsed.searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  } catch {
    return "";
  }
}

export default function LessonPlayer({ lesson, sections, documents }: Props) {
  const hasSections = sections.length > 0;
  const initialSection = hasSections ? sections[0] : null;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    initialSection?.id || null
  );

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) || null,
    [activeSectionId, sections]
  );

  const activeTitle = hasSections
    ? activeSection?.title || initialSection?.title || lesson.title
    : lesson.title;

  const activeVideoUrl = getYoutubeEmbed(
    hasSections
      ? activeSection?.video_url || lesson.video_url || ""
      : lesson.video_url || ""
  );

  return (
    <div className="relative max-w-[1108px]">
      <div className="mb-4 flex items-center justify-between xl:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-white"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          {hasSections ? "Tiet hoc" : "Bai hoc"}
        </button>

        <div className="min-w-0 truncate text-sm font-semibold text-slate-700">
          Video tiet hoc: [{activeTitle}]
        </div>
      </div>

      {mobileOpen && hasSections && (
        <div className="fixed inset-0 z-50 bg-black/40 xl:hidden">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Dong menu"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute left-0 top-0 h-full w-[88vw] max-w-[360px] overflow-y-auto bg-slate-950 p-5 text-white shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">Tiet hoc</div>
                <div className="text-sm text-slate-400">Video theo tung tiet.</div>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl p-2 text-slate-300 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {sections.map((section, index) => {
                const isActive = section.id === activeSectionId;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      setActiveSectionId(section.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ease-out ${
                      isActive
                        ? "border-cyan-300 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(103,232,249,0.14)] scale-[1.01]"
                        : "border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800 hover:scale-[1.01]"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-wide text-cyan-300">
                      Tiet {section.position || index + 1}
                    </div>
                    <div className="mt-1 max-h-12 overflow-y-auto pr-1 text-sm font-semibold leading-snug text-white [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.6)_transparent]">
                      {section.title || `Tiet ${index + 1}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      <div
        className={`grid w-full max-w-[1108px] gap-0 ${
          hasSections ? "xl:h-[520px] xl:grid-cols-[287px_minmax(0,821px)]" : "xl:h-[520px]"
        }`}
      >
        {hasSections ? (
          <aside className="hidden h-full min-h-0 rounded-l-[28px] bg-slate-950 p-5 text-white xl:flex xl:flex-col">
            <div className="mb-4 shrink-0">
              <div className="text-2xl font-bold">Tiet hoc</div>
              <div className="mt-1 text-sm text-slate-400">Video theo tung tiet.</div>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.7)_transparent]">
              {sections.map((section, index) => {
                const isActive = section.id === activeSectionId;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSectionId(section.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ease-out ${
                      isActive
                        ? "border-cyan-300 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(103,232,249,0.18)] scale-[1.01]"
                        : "border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-800/80 hover:scale-[1.01]"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-wide text-cyan-300">
                      Tiet {section.position || index + 1}
                    </div>
                    <div className="mt-1 max-h-12 overflow-y-auto pr-1 text-sm font-semibold leading-snug text-white [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.6)_transparent]">
                      {section.title || `Tiet ${index + 1}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        ) : null}

        <div className="h-[420px] min-w-0 overflow-hidden rounded-r-[28px] bg-[#f6f1dc] p-2 sm:h-[520px] xl:h-full xl:p-4">
          <div className="h-full overflow-hidden rounded-2xl bg-white shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
            <div className="truncate border-b border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900">
              Video tiet hoc: [{activeTitle}]
            </div>

            {activeVideoUrl ? (
              <div className="h-[calc(100%-49px)] w-full bg-slate-100">
                <iframe
                  src={activeVideoUrl}
                  title={activeTitle}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex h-[calc(100%-49px)] w-full min-h-[240px] flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-600">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200">
                  <PlayCircle size={34} className="text-slate-500" />
                </div>
                <h2 className="text-xl font-bold sm:text-2xl">Video dang duoc cap nhat</h2>
              </div>
            )}
          </div>

          {!hasSections && (
            <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">
              Bai hoc nay khong co tiet hoc, video se dung video cua bai hoc.
            </div>
          )}
        </div>
      </div>

      <section className="mt-8 max-w-[1108px] overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Tai lieu bai hoc</h2>
            <p className="text-sm text-slate-500">File giu nguyen theo bai hoc.</p>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Chua co tai lieu</div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 p-5 transition hover:bg-slate-50"
              >
                <a href={`/documents/${doc.id}`} className="flex min-w-0 w-full items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <FileText size={22} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-lg font-semibold">{doc.title}</div>
                    <div className="truncate text-slate-500">{doc.file_name}</div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
