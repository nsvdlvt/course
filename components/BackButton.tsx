"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  href?: string;
  label?: string;
};

export default function BackButton({ href = "/home", label = "Quay lại" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 font-semibold text-slate-700 hover:bg-slate-50"
    >
      <ArrowLeft size={18} />
      {label}
    </button>
  );
}
