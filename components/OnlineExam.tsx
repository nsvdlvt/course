"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  ExternalLink,
  FileText,
  Info,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import PdfExamViewer from "@/components/PdfExamViewer";

type OnlineExamProps = {
  title: string;
  fileUrl: string;
  durationMinutes: number;
  questionCount: number;
  correctAnswers: Record<number, string>;
};

const ANSWERS = ["A", "B", "C", "D"] as const;

type StoredExamProgress = {
  answers: Record<number, string>;
  endsAt: number;
  started: boolean;
};

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
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [answerSheetOpen, setAnswerSheetOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const storageKey = useMemo(
    () => `online-exam-progress:${fileUrl}:${questionCount}`,
    [fileUrl, questionCount]
  );

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
    if (!started || reviewing || showResult) {
      return;
    }

    if (!endsAt) {
      return;
    }

    const timer = window.setInterval(() => {
      const next = Math.max(Math.ceil((endsAt - Date.now()) / 1000), 0);
      setRemainingSeconds(next);

      if (next === 0) {
        setShowResult(true);
        window.localStorage.removeItem(storageKey);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [endsAt, reviewing, showResult, started, storageKey]);

  useEffect(() => {
    const restoreProgress = window.setTimeout(() => {
      const savedProgress = window.localStorage.getItem(storageKey);

      if (!savedProgress) {
        return;
      }

      try {
        const progress = JSON.parse(savedProgress) as StoredExamProgress;

        if (!progress.started || progress.endsAt <= Date.now()) {
          window.localStorage.removeItem(storageKey);
          return;
        }

        setAnswers(progress.answers || {});
        setEndsAt(progress.endsAt);
        setRemainingSeconds(
          Math.max(Math.ceil((progress.endsAt - Date.now()) / 1000), 0)
        );
        setStarted(true);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }, 0);

    return () => window.clearTimeout(restoreProgress);
  }, [storageKey]);

  useEffect(() => {
    if (!started || reviewing || showResult) {
      return;
    }

    if (!endsAt) {
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        answers,
        endsAt,
        started: true,
      } satisfies StoredExamProgress)
    );
  }, [answers, endsAt, reviewing, showResult, started, storageKey]);

  const answeredCount = Object.keys(answers).length;
  const unansweredQuestions = Array.from(
    { length: questionCount },
    (_, index) => index + 1
  ).filter((questionNumber) => !answers[questionNumber]);
  const startExam = () => {
    const endsAt = Date.now() + durationSeconds * 1000;

    setStarted(true);
    setEndsAt(endsAt);
    setRemainingSeconds(durationSeconds);
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        answers,
        endsAt,
        started: true,
      } satisfies StoredExamProgress)
    );
  };
  const submitExam = () => {
    setShowSubmitConfirm(false);
    setShowResult(true);
    setAnswerSheetOpen(false);
    window.localStorage.removeItem(storageKey);
  };
  const answerPanel = (
    <>
      <div className="mb-4 grid grid-cols-3 gap-3 sm:mb-5">
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

        <div className="max-h-[48vh] overflow-y-auto sm:max-h-[42vh] xl:max-h-[58vh]">
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
        onClick={() => setShowSubmitConfirm(true)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f6696] px-5 py-3 font-bold text-white transition hover:bg-[#285578] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CheckCircle2 size={20} />
        Hoàn thành
      </button>
    </>
  );

  return (
    <main className="min-h-screen bg-[#eef3f7] px-2 py-3 pb-24 sm:px-5 sm:py-4 sm:pb-4 lg:px-8">
      {!started && (
        <div className="flex min-h-[calc(100svh-96px)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-sm"
        >
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
            onClick={startExam}
            className="mt-6 rounded-xl bg-[#1f6696] px-6 py-3 font-bold text-white transition hover:bg-[#285578]"
          >
            Bắt đầu làm bài
          </button>
        </motion.div>
        </div>
      )}

      {started && (
      <div className="mx-auto grid max-w-[1780px] gap-4 xl:grid-cols-[minmax(0,1fr)_430px] xl:gap-5">
        <section className="min-h-[calc(100svh-104px)] overflow-hidden rounded-md border border-slate-300 bg-slate-200 shadow-sm xl:min-h-[70vh]">
          <div className="hidden items-center justify-between border-b border-slate-300 bg-slate-100 px-4 py-3 sm:flex">
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

          <div className="h-[calc(100svh-104px)] sm:h-[calc(100vh-132px)]">
            <PdfExamViewer fileUrl={fileUrl} />
          </div>
        </section>

        <aside className="hidden rounded-md bg-white p-5 shadow-sm xl:sticky xl:top-20 xl:block xl:max-h-[calc(100vh-96px)]">
          {answerPanel}
        </aside>
      </div>
      )}

      {started && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-[#17659a] px-5 py-3 text-white shadow-[0_-10px_30px_rgba(15,23,42,0.22)] xl:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <div className="min-w-[112px] border-r border-white/70 pr-4 text-4xl font-black leading-none">
              {formatTime(remainingSeconds)}
            </div>
            <button
              type="button"
              onClick={() => setAnswerSheetOpen((open) => !open)}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#0d4f7f] px-4 text-lg font-semibold"
            >
              Bài làm
              {answerSheetOpen ? (
                <ChevronDown size={22} />
              ) : (
                <ChevronUp size={22} />
              )}
            </button>
            <button
              type="button"
              disabled={reviewing}
              onClick={() => setShowSubmitConfirm(true)}
              className="min-h-12 rounded-md bg-white px-5 text-lg font-semibold text-[#1f6696] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Nộp bài
            </button>
            <div className="absolute right-5 top-2 text-lg font-black">
              {answeredCount}/{questionCount}
            </div>
          </div>
        </div>
      )}

      {started && answerSheetOpen && (
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-[88px] z-40 px-3 xl:hidden"
        >
          <div className="mx-auto max-w-xl rounded-t-2xl bg-white p-4 shadow-2xl">
            {answerPanel}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
            >
              {unansweredQuestions.length > 0 && (
                <p className="text-lg font-bold leading-relaxed text-red-500">
                  Bạn còn các câu sau chưa hoàn thành:{" "}
                  <span className="font-medium">
                    {unansweredQuestions.join(", ")}
                  </span>
                </p>
              )}
              <p className="mt-4 text-center text-xl font-black leading-snug text-slate-950">
                Khi đã kết thúc phần thi, bạn sẽ không quay lại phần thi này.
                <br />
                Bạn có chắc chắn KẾT THÚC phần thi này?
              </p>
              <div className="mx-auto mt-7 grid max-w-xs grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={submitExam}
                  className="rounded-xl bg-[#17659a] px-4 py-3 font-bold text-white"
                >
                  Kết thúc
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="rounded-xl bg-red-500 px-4 py-3 font-bold text-white"
                >
                  Không
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
      {showResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
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
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </main>
  );
}
