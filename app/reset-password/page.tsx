"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Lock } from "lucide-react";

import { supabase } from "@/lib/supabase";

function getUpdatePasswordErrorMessage(errorMessage: string) {
  const normalizedMessage = errorMessage.toLowerCase();

  if (
    normalizedMessage.includes("session") ||
    normalizedMessage.includes("jwt") ||
    normalizedMessage.includes("token")
  ) {
    return "Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Hãy gửi lại link mới.";
  }

  if (normalizedMessage.includes("password")) {
    return "Mật khẩu chưa hợp lệ. Hãy dùng mật khẩu mạnh hơn.";
  }

  if (normalizedMessage.includes("rate limit")) {
    return "Bạn thao tác quá nhanh. Chờ một chút rồi thử lại nhé.";
  }

  return errorMessage || "Không đổi được mật khẩu. Thử lại sau nhé.";
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setCheckingSession(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setCheckingSession(false);
        return;
      }

      setMessage("Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.");
      setCheckingSession(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setSuccess("");

    if (password.length < 6) {
      setMessage("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Mật khẩu nhập lại chưa khớp.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(getUpdatePasswordErrorMessage(error.message));
      return;
    }

    setSuccess("Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.");

    window.setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    }, 1200);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-5">
      <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur">
        <h1 className="text-center text-3xl font-black text-slate-900">
          Đặt lại mật khẩu
        </h1>

        <p className="mt-2 text-center text-slate-500">
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Mật khẩu mới"
              disabled={checkingSession}
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
            />
          </div>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              disabled={checkingSession}
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
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
            disabled={loading || checkingSession}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
          </button>
        </form>

        <Link
          href="/forgot-password"
          className="mt-5 block text-center text-sm font-medium text-blue-600"
        >
          Gửi lại link đặt mật khẩu
        </Link>
      </div>
    </main>
  );
}
