"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Lock, Mail } from "lucide-react";

import GoogleLoginButton from "@/components/GoogleLoginButton";
import { supabase } from "@/lib/supabase";

function getLoginErrorMessage(errorMessage: string) {
  const normalizedMessage = errorMessage.toLowerCase();

  if (normalizedMessage.includes("email not confirmed")) {
    return "Email chưa được xác nhận. Kiểm tra hộp thư rồi bấm link xác nhận nhé.";
  }

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid credentials")
  ) {
    return "Email hoặc mật khẩu chưa đúng.";
  }

  if (normalizedMessage.includes("rate limit")) {
    return "Bạn thử quá nhiều lần rồi. Chờ một chút rồi thử lại nhé.";
  }

  return errorMessage || "Không đăng nhập được. Thử lại sau nhé.";
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Nhập email và mật khẩu để đăng nhập.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(getLoginErrorMessage(error.message));
      return;
    }

    const redirectTo = searchParams.get("redirectTo");
    const safeRedirectTo =
      redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
        ? redirectTo
        : "/home";

    router.push(safeRedirectTo);
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-5">
      <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur">
        <h1 className="text-center text-3xl font-black text-slate-900">
          NSVDCourse
        </h1>

        <p className="mt-2 text-center text-slate-500">
          Đăng nhập để tiếp tục học tập
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

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Mật khẩu"
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-blue-600">
              Quên mật khẩu?
            </Link>
          </div>

          {message && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {message}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <GoogleLoginButton redirectTo={searchParams.get("redirectTo")} />

        <p className="mt-6 text-center text-slate-500">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-medium text-blue-600">
            Đăng ký
          </Link>
        </p>
      </div>
    </main>
  );
}
