// components/BackButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="
        inline-flex
        items-center
        gap-2
        rounded-2xl
        border
        border-slate-300
        bg-white
        px-6
        py-4
        font-semibold
        text-slate-700
        hover:bg-slate-50
      "
    >
      <ArrowLeft size={18} />
      Quay lại
    </button>
  );
}