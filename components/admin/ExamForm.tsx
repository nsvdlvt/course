"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, UploadCloud } from "lucide-react";

import { supabase } from "@/lib/supabase";

type DocumentItem = {
  id: string;
  title: string;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
};

type LessonItem = {
  id: string;
  title: string;
  chapters?: {
    title: string;
    courses?: {
      title: string;
    } | null;
  } | null;
};

type ExamItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_minutes: number | null;
  question_count: number | null;
  file_url: string;
  file_name: string | null;
  document_id: string | null;
  answers: Record<string, string> | null;
  exam_type: "free" | "lesson";
  lesson_id: string | null;
};

type ExamFormProps = {
  documents: DocumentItem[];
  lessons: LessonItem[];
  exam?: ExamItem;
};

const ANSWERS = ["A", "B", "C", "D"] as const;

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getSafeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_");
}

function parseAnswerCode(value: string, questionCount: number) {
  const result: Record<number, string> = {};
  const matches = value.toUpperCase().matchAll(/(\d+)\s*([ABCD])/g);

  for (const match of matches) {
    const question = Number(match[1]);
    const answer = match[2];

    if (question >= 1 && question <= questionCount) {
      result[question] = answer;
    }
  }

  return result;
}

function normalizeAnswers(answers?: Record<string, string> | null) {
  const result: Record<number, string> = {};

  for (const [question, answer] of Object.entries(answers || {})) {
    result[Number(question)] = answer;
  }

  return result;
}

export default function ExamForm({ documents, lessons, exam }: ExamFormProps) {
  const router = useRouter();
  const editing = Boolean(exam);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(exam?.title || "");
  const [slug, setSlug] = useState(exam?.slug || "");
  const [description, setDescription] = useState(exam?.description || "");
  const [durationMinutes, setDurationMinutes] = useState(
    exam?.duration_minutes || 60
  );
  const [questionCount, setQuestionCount] = useState(
    exam?.question_count || 19
  );
  const [examType, setExamType] = useState<"free" | "lesson">(
    exam?.exam_type || "free"
  );
  const [lessonId, setLessonId] = useState(exam?.lesson_id || "");
  const [fileMode, setFileMode] = useState<"upload" | "library">(
    exam?.document_id ? "library" : "upload"
  );
  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState(exam?.document_id || "");
  const [answerMode, setAnswerMode] = useState<"manual" | "code">("manual");
  const [manualAnswers, setManualAnswers] = useState<Record<number, string>>(
    normalizeAnswers(exam?.answers)
  );
  const [answerCode, setAnswerCode] = useState("");

  const selectedDocument = documents.find(
    (document) => document.id === documentId
  );
  const parsedAnswers = useMemo(
    () => parseAnswerCode(answerCode, questionCount),
    [answerCode, questionCount]
  );
  const answers = answerMode === "manual" ? manualAnswers : parsedAnswers;
  const answeredCount = Object.keys(answers).length;

  async function uploadExamFile() {
    if (!file) {
      throw new Error("Chưa chọn file đề.");
    }

    const filePath = `${Date.now()}-${crypto.randomUUID()}-${getSafeFileName(
      file.name
    )}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filePath);

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .insert({
        title: title.trim() || file.name.replace(/\.[^/.]+$/, ""),
        description: description.trim(),
        folder_id: null,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || "application/pdf",
      })
      .select("id,title,file_url,file_name,file_type")
      .single();

    if (documentError) {
      throw new Error(documentError.message);
    }

    return document as DocumentItem;
  }

  async function saveExam() {
    if (!title.trim()) {
      alert("Nhập tên đề thi");
      return;
    }

    if (questionCount < 1) {
      alert("Số câu phải lớn hơn 0");
      return;
    }

    if (examType === "lesson" && !lessonId) {
      alert("Chọn bài học để gắn đề thi");
      return;
    }

    try {
      setLoading(true);

      const examDocument =
        fileMode === "upload" && file
          ? await uploadExamFile()
          : selectedDocument;

      const fileUrl = examDocument?.file_url || exam?.file_url;

      if (!fileUrl) {
        alert("Chọn hoặc upload file đề thi");
        return;
      }

      const payload = {
        title: title.trim(),
        slug: slug || generateSlug(title),
        description: description.trim(),
        duration_minutes: durationMinutes,
        question_count: questionCount,
        file_url: fileUrl,
        file_name: examDocument?.file_name || exam?.file_name || null,
        document_id: examDocument?.id || documentId || exam?.document_id || null,
        answers,
        exam_type: examType,
        lesson_id: examType === "lesson" ? lessonId : null,
      };

      const { error } = editing
        ? await supabase.from("exams").update(payload).eq("id", exam!.id)
        : await supabase.from("exams").insert(payload);

      if (error) {
        alert(error.message);
        return;
      }

      alert(editing ? "Cập nhật đề thi thành công" : "Tạo đề thi thành công");
      router.push("/admin/exams");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không lưu được đề thi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl bg-white p-8 shadow">
      <section className="rounded-3xl border border-slate-200 p-5">
        <h2 className="mb-4 font-bold">Loại đề thi</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setExamType("free")}
            className={`rounded-xl px-4 py-2 font-semibold ${
              examType === "free"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Tự do
          </button>
          <button
            type="button"
            onClick={() => setExamType("lesson")}
            className={`rounded-xl px-4 py-2 font-semibold ${
              examType === "lesson"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Bài học
          </button>
        </div>

        {examType === "lesson" && (
          <div className="mt-4">
            <label className="font-medium">Gắn với bài học</label>
            <select
              value={lessonId}
              onChange={(event) => setLessonId(event.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3"
            >
              <option value="">Chọn bài học</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.chapters?.courses?.title
                    ? `${lesson.chapters.courses.title} - `
                    : ""}
                  {lesson.chapters?.title ? `${lesson.chapters.title} - ` : ""}
                  {lesson.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="font-medium">Tên đề thi</label>
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!slug) {
                setSlug(generateSlug(event.target.value));
              }
            }}
            className="mt-2 w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="font-medium">Slug</label>
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="mt-2 w-full rounded-xl border px-4 py-3"
          />
        </div>
      </div>

      <div>
        <label className="font-medium">Mô tả</label>
        <textarea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-2 w-full rounded-xl border px-4 py-3"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="font-medium">Số lượng câu trắc nghiệm</label>
          <input
            type="number"
            min={1}
            value={questionCount}
            onChange={(event) => setQuestionCount(Number(event.target.value))}
            className="mt-2 w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="font-medium">Thời gian làm bài (phút)</label>
          <input
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
            className="mt-2 w-full rounded-xl border px-4 py-3"
          />
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 p-5">
        <div className="mb-4 flex items-center gap-2 font-bold">
          <FileText size={20} />
          Đề thi
        </div>

        {editing && exam?.file_name && (
          <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            File hiện tại: <span className="font-semibold">{exam.file_name}</span>
          </p>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFileMode("upload")}
            className={`rounded-xl px-4 py-2 font-semibold ${
              fileMode === "upload"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Upload đề
          </button>
          <button
            type="button"
            onClick={() => setFileMode("library")}
            className={`rounded-xl px-4 py-2 font-semibold ${
              fileMode === "library"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Chọn đề trong hệ thống
          </button>
        </div>

        {fileMode === "upload" ? (
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 hover:bg-slate-100">
            <UploadCloud size={24} className="text-blue-600" />
            <span className="font-medium">
              {file ? file.name : "Chọn file PDF để upload"}
            </span>
            <input
              hidden
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>
        ) : (
          <select
            value={documentId}
            onChange={(event) => setDocumentId(event.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="">Chọn tài liệu PDF</option>
            {documents.map((document) => (
              <option key={document.id} value={document.id}>
                {document.title} - {document.file_name}
              </option>
            ))}
          </select>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-bold">Đáp án</h2>
          <span className="text-sm font-semibold text-slate-500">
            Đã nhập {answeredCount}/{questionCount}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAnswerMode("manual")}
            className={`rounded-xl px-4 py-2 font-semibold ${
              answerMode === "manual"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Chọn thủ công
          </button>
          <button
            type="button"
            onClick={() => setAnswerMode("code")}
            className={`rounded-xl px-4 py-2 font-semibold ${
              answerMode === "code"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Nhập code 1A2B3C4D
          </button>
        </div>

        {answerMode === "manual" ? (
          <div className="max-h-[420px] overflow-y-auto rounded-2xl border">
            {Array.from({ length: questionCount }, (_, index) => {
              const questionNumber = index + 1;

              return (
                <div
                  key={questionNumber}
                  className={`grid grid-cols-[84px_1fr] items-center px-4 py-3 ${
                    index % 2 ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  <div className="font-semibold text-slate-700">
                    Câu {questionNumber}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ANSWERS.map((answer) => (
                      <button
                        key={answer}
                        type="button"
                        onClick={() =>
                          setManualAnswers((current) => ({
                            ...current,
                            [questionNumber]: answer,
                          }))
                        }
                        className={`flex h-9 w-9 items-center justify-center rounded-full border font-bold ${
                          manualAnswers[questionNumber] === answer
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white text-slate-500"
                        }`}
                      >
                        {answer}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <textarea
              rows={4}
              value={answerCode}
              onChange={(event) => setAnswerCode(event.target.value)}
              placeholder="Ví dụ: 1A2B3C4D hoặc 1A 2B 3C 4D"
              className="w-full rounded-xl border px-4 py-3"
            />
            <p className="mt-2 text-sm text-slate-500">
              Hệ thống sẽ đọc số câu và đáp án A/B/C/D trong chuỗi code.
            </p>
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={saveExam}
        disabled={loading}
        className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading
          ? editing
            ? "Đang lưu..."
            : "Đang tạo..."
          : editing
            ? "Lưu đề thi"
            : "Tạo đề thi"}
      </button>
    </div>
  );
}
