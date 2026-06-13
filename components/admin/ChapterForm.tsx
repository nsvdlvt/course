"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

interface Props {
  courseId: string;
}

export default function ChapterForm({ courseId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState(1);

  async function createChapter() {
    if (!title.trim()) {
      alert("Nhap ten chuong");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("chapters").insert({
        course_id: courseId,
        title: title.trim(),
        position,
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Tao chuong thanh cong");
      router.push(`/admin/courses/${courseId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl bg-white p-8 shadow">
      <div>
        <label className="font-medium">Ten chuong</label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-2 w-full rounded-xl border px-4 py-3"
        />
      </div>

      <div>
        <label className="font-medium">Thu tu</label>
        <input
          type="number"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="mt-2 w-full rounded-xl border px-4 py-3"
        />
      </div>

      <button
        type="button"
        onClick={createChapter}
        disabled={loading}
        className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Dang tao..." : "Tao chuong"}
      </button>
    </div>
  );
}
