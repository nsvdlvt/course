"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, ClipboardList, FileText, Menu, PlayCircle, X } from "lucide-react";

type LessonDocument = {
  id: string;
  title: string;
  file_url: string;
  file_name: string | null;
};

type LessonSectionExam = {
  id: string;
  title: string;
  slug: string;
  duration_minutes: number | null;
  question_count: number | null;
};

type LessonSection = {
  id: string;
  title: string;
  video_url: string | null;
  position: number;
  exam?: LessonSectionExam | null;
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

  const activeExam = activeSection?.exam || null;
  const showExamCard = Boolean(activeExam) && !activeVideoUrl;

  return (
    <div className="relative max-w-[1108px]">
      <div className="mb-4 flex items-center justify-between xl:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-white"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          {hasSections ? "Tiết học" : "Bài học"}
        </button>

        <div className="min-w-0 truncate text-sm font-semibold text-slate-700">
          Video tiết học: [{activeTitle}]
        </div>
      </div>

      {mobileOpen && hasSections && (
        <div className="fixed inset-0 z-50 bg-black/40 xl:hidden">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Đóng menu"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute left-0 top-0 h-full w-[88vw] max-w-[360px] overflow-y-auto bg-slate-950 p-5 text-white shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">Tiết học</div>
                <div className="text-sm text-slate-400">Video và bài thi theo từng tiết.</div>
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
                      {section.exam && !section.video_url ? "Bài thi" : "Tiết"} {section.position || index + 1}
                    </div>
                    <div className="mt-1 max-h-12 overflow-y-auto pr-1 text-sm font-semibold leading-snug text-white [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.6)_transparent]">
                      {section.title || `Tiết ${index + 1}`}
                    </div>
                    {section.exam && (
                      <div className="mt-2 text-xs text-emerald-300">Có bài thi online</div>
                    )}
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
              <div className="text-2xl font-bold">Tiết học</div>
              <div className="mt-1 text-sm text-slate-400">Video và bài thi theo từng tiết.</div>
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
                      {section.exam && !section.video_url ? "Bài thi" : "Tiết"} {section.position || index + 1}
                    </div>
                    <div className="mt-1 max-h-12 overflow-y-auto pr-1 text-sm font-semibold leading-snug text-white [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.6)_transparent]">
                      {section.title || `Tiết ${index + 1}`}
                    </div>
                    {section.exam && (
                      <div className="mt-2 text-xs text-emerald-300">Có bài thi online</div>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        ) : null}

        <div className="h-[420px] min-w-0 overflow-hidden rounded-r-[28px] bg-[#f6f1dc] p-2 sm:h-[520px] xl:h-full xl:p-4">
          <div className="h-full overflow-hidden rounded-2xl bg-white shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
            <div className="truncate border-b border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900">
              Video tiết học: [{activeTitle}]
            </div>

            {showExamCard && activeExam ? (
              <div className="flex h-[calc(100%-49px)] w-full items-center justify-center bg-slate-50 px-6">
                <div className="w-full max-w-xl rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <ClipboardList size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">{activeExam.title}</h2>
                  <p className="mt-3 text-sm text-slate-600">
                    Đây là bài thi online của mục này. Nhấn nút bên dưới để chuyển sang trang làm đề.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm font-semibold text-slate-600">
                    <span className="rounded-full bg-slate-100 px-4 py-2">{activeExam.question_count || 0} câu</span>
                    <span className="rounded-full bg-slate-100 px-4 py-2">{activeExam.duration_minutes || 0} phút</span>
                  </div>
                  <Link
                    href={`/exam/${activeExam.slug}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700"
                  >
                    <ClipboardList size={18} />
                    Làm bài thi
                  </Link>
                </div>
              </div>
            ) : activeVideoUrl ? (
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
                <h2 className="text-xl font-bold sm:text-2xl">Video đang được cập nhật</h2>
              </div>
            )}
          </div>

          {activeExam && !showExamCard && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-emerald-700">
                <ClipboardList size={20} />
                <h3 className="text-lg font-bold">Bài thi online</h3>
              </div>
              <p className="font-semibold text-slate-900">{activeExam.title}</p>
              <p className="mt-2 text-sm text-slate-600">
                {activeExam.question_count || 0} câu • {activeExam.duration_minutes || 0} phút
              </p>
              <Link
                href={`/exam/${activeExam.slug}`}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                <ClipboardList size={18} />
                Làm bài thi
              </Link>
            </div>
          )}

          {!hasSections && (
            <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">
              Bài học này không có tiết học, video sẽ dùng video của bài học.
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
            <h2 className="text-2xl font-bold">Tài liệu bài học</h2>
            <p className="text-sm text-slate-500">Các tài liệu bổ trợ bài học</p>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Chưa có tài liệu</div>
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
