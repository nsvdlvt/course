import { notFound } from "next/navigation";

import OnlineExam from "@/components/OnlineExam";
import { supabase } from "@/lib/supabase";

type ExamRoomPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ExamItem = {
  id: string;
  title: string;
  slug: string;
  file_url: string | null;
  duration_minutes: number | null;
  question_count: number | null;
  answers: Record<string, string> | null;
};

export default async function ExamRoomPage({ params }: ExamRoomPageProps) {
  const { slug } = await params;

  const { data: exam } = await supabase
    .from("exams")
    .select("id,title,slug,file_url,duration_minutes,question_count,answers")
    .eq("slug", slug)
    .single();

  if (!exam) {
    notFound();
  }

  const item = exam as ExamItem;
  if (!item.file_url) {
    notFound();
  }

  return (
    <OnlineExam
      title={item.title}
      fileUrl={item.file_url}
      durationMinutes={item.duration_minutes || 60}
      questionCount={item.question_count || 19}
      correctAnswers={Object.fromEntries(
        Object.entries(item.answers || {}).map(([question, answer]) => [Number(question), answer])
      )}
    />
  );
}
