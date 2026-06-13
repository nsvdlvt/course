"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Info,
  XCircle,
} from "lucide-react";

import PdfExamViewer from "@/components/PdfExamViewer";

type OnlineExamProps = {
  title: string;
  fileUrl: string;
  durationMinutes: number;
  questionCount: number;
  correctAnswers: Record<number, string>;
};

const ANSWERS = ["A", "B", "C", "D"] as const;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function getResult(
  answers: Record<number, string>,
  correctAnswers: Record<number, string>,
  questionCount: number,
  durationSeconds: number,
  remainingSeconds: number
) {
  let correct = 0;

  for (let question = 1; question <= questionCount; question += 1) {
    if (answers[question] && answers[question] === correctAnswers[question]) {
      correct += 1;
    }
  }

  const wrong = questionCount - correct;
  const score = questionCount ? (correct / questionCount) * 10 : 0;
  const ratio = questionCount ? (correct / questionCount) * 100 : 0;
  const usedSeconds = Math.max(durationSeconds - remainingSeconds, 0);

  return { correct, wrong, score, ratio, usedSeconds };
}

export default function OnlineExam({
  title,
  fileUrl,
  durationMinutes,
  questionCount,
  correctAnswers,
}: OnlineExamProps) {
  const durationSeconds = durationMinutes * 60;
  const [started, setStarted] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const result = useMemo(
    () =>
      getResult(
        answers,
        correctAnswers,
        questionCount,
        durationSeconds,
        remainingSeconds
      ),
    [answers, correctAnswers, durationSeconds, questionCount, remainingSeconds]
  );

  useEffect(() => {
    setRemainingSeconds(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (!started || reviewing || showResult) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [reviewing, showResult, started]);

  useEffect(() => {
    if (started && remainingSeconds === 0 && !reviewing && !showResult) {
      setShowResult(true);
    }
  }, [remainingSeconds, reviewing, showResult, started]);

  const answeredCount = Object.keys(answers).length;

  return (
    <main className="min-h-screen bg-[#eef3f7] px-3 py-4 sm:px-5 lg:px-8">
      {!started && (
        <div className="mx-auto mb-5 max-w-[1780px] rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Info size={26} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1f6696]">
                Thông tin đề
              </p>
              <h1 className="text-3xl font-black text-slate-950">{title}</h1>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">Loại câu hỏi</div>
              <div className="mt-2 text-xl font-bold">Trắc nghiệm A/B/C/D</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">Số lượng câu</div>
              <div className="mt-2 text-xl font-bold">{questionCount} câu</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">Thời gian</div>
              <div className="mt-2 text-xl font-bold">{durationMinutes} phút</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">Thang điểm</div>
              <div className="mt-2 text-xl font-bold">10 điểm</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-6 rounded-xl bg-[#1f6696] px-6 py-3 font-bold text-white transition hover:bg-[#285578]"
          >
            Bắt đầu làm bài
          </button>
        </div>
      )}

      <div className="mx-auto grid max-w-[1780px] gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <section className="min-h-[70vh] overflow-hidden rounded-md border border-slate-300 bg-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-300 bg-slate-100 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700">
                <FileText size={22} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-slate-900">
                  {title}
                </h1>
                <p className="truncate text-sm text-slate-500">
                  Trình xem PDF cuộn liên trang, chọn đáp án ở bảng bên cạnh.
                </p>
              </div>
            </div>

            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
            >
              <ExternalLink size={16} />
              Mở file
            </a>
          </div>

          <div className="h-[68vh] sm:h-[calc(100vh-132px)]">
            <PdfExamViewer fileUrl={fileUrl} />
          </div>
        </section>

        <aside className="rounded-md bg-white p-5 shadow-sm xl:sticky xl:top-20 xl:max-h-[calc(100vh-96px)]">
          <div className="mb-5 grid grid-cols-3 gap-3">
            {reviewing ? (
              <>
                <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                  <div className="text-sm font-bold text-emerald-700">Đúng</div>
                  <div className="mt-1 text-2xl font-black text-emerald-700">
                    {result.correct}
                  </div>
                </div>
                <div className="rounded-2xl bg-red-50 p-3 text-center">
                  <div className="text-sm font-bold text-red-700">Sai</div>
                  <div className="mt-1 text-2xl font-black text-red-700">
                    {result.wrong}
                  </div>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3 text-center">
                  <div className="text-sm font-bold text-blue-700">Điểm</div>
                  <div className="mt-1 text-2xl font-black text-blue-700">
                    {result.score.toFixed(1)}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-2 rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <Clock3 size={17} />
                    Thời gian
                  </div>
                  <div className="mt-1 text-3xl font-black text-[#285578]">
                    {formatTime(remainingSeconds)}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-center">
                  <div className="text-sm font-bold text-slate-500">Đã làm</div>
                  <div className="mt-1 text-2xl font-black text-[#285578]">
                    {answeredCount}/{questionCount}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="overflow-hidden rounded-sm border border-slate-200">
            <div className="grid grid-cols-[92px_1fr] bg-[#1f6696] px-3 py-3 text-white">
              <div className="font-bold">Câu</div>
              <div className="text-center font-bold">Chọn đáp án</div>
            </div>

            <div className="max-h-[58vh] overflow-y-auto">
              {Array.from({ length: questionCount }, (_, index) => {
                const questionNumber = index + 1;
                const selectedAnswer = answers[questionNumber];
                const correctAnswer = correctAnswers[questionNumber];
                const isCorrect = selectedAnswer === correctAnswer;

                return (
                  <div
                    key={questionNumber}
                    className={`grid grid-cols-[92px_1fr] items-center px-3 py-2.5 ${
                      reviewing
                        ? isCorrect
                          ? "bg-emerald-50"
                          : "bg-red-50"
                        : index % 2 === 1
                          ? "bg-[#e5f2fb]"
                          : "bg-white"
                    }`}
                  >
                    <div
                      className={`font-medium ${
                        reviewing
                          ? isCorrect
                            ? "text-emerald-700"
                            : "text-red-700"
                          : "text-[#285578]"
                      }`}
                    >
                      Câu {questionNumber}:
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {ANSWERS.map((answer) => {
                        const selected = selectedAnswer === answer;
                        const isRightAnswer = correctAnswer === answer;
                        const isWrongSelected =
                          reviewing && selected && !isRightAnswer;

                        return (
                          <button
                            key={answer}
                            type="button"
                            disabled={!started || reviewing}
                            onClick={() =>
                              setAnswers((current) => ({
                                ...current,
                                [questionNumber]: answer,
                              }))
                            }
                            className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition disabled:cursor-default ${
                              reviewing && isRightAnswer
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : isWrongSelected
                                  ? "border-red-600 bg-red-600 text-white"
                                  : selected
                                    ? "border-[#1f6696] bg-[#1f6696] text-white shadow-sm"
                                    : "border-slate-300 bg-white text-slate-400 hover:border-[#1f6696] hover:text-[#1f6696]"
                            }`}
                          >
                            {answer}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            disabled={!started || reviewing}
            onClick={() => setShowResult(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f6696] px-5 py-3 font-bold text-white transition hover:bg-[#285578] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 size={20} />
            Hoàn thành
          </button>
        </aside>
      </div>

      {showResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-950">
              Kết quả bài thi
            </h2>
            <div className="mt-5 space-y-3 text-slate-700">
              <div>Thời gian làm bài: {formatTime(result.usedSeconds)}</div>
              <div>Số điểm: {result.score.toFixed(2)}/10</div>
              <div>Số câu đúng: {result.correct}</div>
              <div>Số câu sai: {result.wrong}</div>
              <div>Tỉ lệ: {result.ratio.toFixed(1)}%</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowResult(false);
                setReviewing(true);
              }}
              className="mt-6 w-full rounded-xl bg-[#1f6696] px-5 py-3 font-bold text-white hover:bg-[#285578]"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
