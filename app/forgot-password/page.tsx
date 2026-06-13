"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";

import { supabase } from "@/lib/supabase";

function getResetEmailErrorMessage(errorMessage: string) {
  const normalizedMessage = errorMessage.toLowerCase();

  if (normalizedMessage.includes("invalid email")) {
    return "Email chưa đúng định dạng.";
  }

  if (normalizedMessage.includes("rate limit")) {
    return "Bạn gửi quá nhiều lần rồi. Chờ một chút rồi thử lại nhé.";
  }

  return errorMessage || "Không gửi được email đặt lại mật khẩu. Thử lại sau nhé.";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setSuccess("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setMessage("Nhập email tài khoản của bạn.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setMessage(getResetEmailErrorMessage(error.message));
      return;
    }

    setSuccess(
      "Nếu email này có tài khoản, link đặt lại mật khẩu đã được gửi. Kiểm tra hộp thư và thư rác nhé."
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-5">
      <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur">
        <h1 className="text-center text-3xl font-black text-slate-900">
          Quên mật khẩu
        </h1>

        <p className="mt-2 text-center text-slate-500">
          Nhập email để nhận link đặt lại mật khẩu.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="Email"
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {message && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {message}
            </p>
          )}

          {success && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Đang gửi..." : "Gửi link đặt lại"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-blue-600"
        >
          <ArrowLeft size={16} />
          Quay lại đăng nhập
        </Link>
      </div>
    </main>
  );
}
