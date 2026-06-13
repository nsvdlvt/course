"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Lock, Mail, User } from "lucide-react";

import GoogleLoginButton from "@/components/GoogleLoginButton";
import { supabase } from "@/lib/supabase";

function getRegisterErrorMessage(errorMessage: string) {
  const normalizedMessage = errorMessage.toLowerCase();

  if (
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("already exists") ||
    normalizedMessage.includes("duplicate key") ||
    normalizedMessage.includes("profiles_email_key")
  ) {
    return "Email này đã tồn tại. Đăng nhập hoặc dùng email khác nhé.";
  }

  if (normalizedMessage.includes("profiles_username_key")) {
    return "Tên đăng nhập này đã tồn tại. Chọn tên khác nhé.";
  }

  if (normalizedMessage.includes("password")) {
    return "Mật khẩu chưa hợp lệ. Hãy dùng mật khẩu mạnh hơn.";
  }

  if (normalizedMessage.includes("invalid email")) {
    return "Email chưa đúng định dạng.";
  }

  if (normalizedMessage.includes("rate limit")) {
    return "Bạn thao tác quá nhanh. Chờ một chút rồi thử lại nhé.";
  }

  return errorMessage || "Không tạo được tài khoản. Thử lại sau nhé.";
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setSuccess("");

    if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
      setMessage("Điền đầy đủ thông tin để tạo tài khoản.");
      return;
    }

    if (password.length < 6) {
      setMessage("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Mật khẩu nhập lại chưa khớp.");
      return;
    }

    setLoading(true);

    const cleanEmail = email.trim();
    const cleanUsername = username.trim();
    const cleanFullName = fullName.trim();

    const { data: existingProfiles, error: checkError } = await supabase
      .from("profiles")
      .select("email, username")
      .or(`email.eq.${cleanEmail},username.eq.${cleanUsername}`)
      .limit(2);

    if (checkError) {
      setLoading(false);
      setMessage(getRegisterErrorMessage(checkError.message));
      return;
    }

    const existingEmail = existingProfiles?.some(
      (profile) => profile.email === cleanEmail
    );
    const existingUsername = existingProfiles?.some(
      (profile) => profile.username === cleanUsername
    );

    if (existingEmail) {
      setLoading(false);
      setMessage("Email này đã tồn tại. Đăng nhập hoặc dùng email khác nhé.");
      return;
    }

    if (existingUsername) {
      setLoading(false);
      setMessage("Tên đăng nhập này đã tồn tại. Chọn tên khác nhé.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: cleanFullName,
          username: cleanUsername,
        },
      },
    });

    if (error) {
      setLoading(false);
      setMessage(getRegisterErrorMessage(error.message));
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        email: cleanEmail,
        username: cleanUsername,
        full_name: cleanFullName,
      });

      if (profileError) {
        setLoading(false);
        setMessage(getRegisterErrorMessage(profileError.message));
        return;
      }
    }

    setLoading(false);

    if (!data.session) {
      setSuccess("Tạo tài khoản thành công. Kiểm tra email để xác nhận nhé.");
      return;
    }

    router.push("/home");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-5 py-8">
      <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur">
        <h1 className="text-center text-3xl font-black text-slate-900">
          Đăng ký tài khoản
        </h1>

        <p className="mt-2 text-center text-slate-500">
          Tạo tài khoản để lưu tiến độ học tập
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <User
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Họ và tên"
              autoComplete="name"
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="relative">
            <User
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Tên đăng nhập"
              autoComplete="username"
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              autoComplete="email"
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
              autoComplete="new-password"
              placeholder="Mật khẩu"
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
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu"
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
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <GoogleLoginButton label="Đăng ký bằng Google" />

        <p className="mt-6 text-center text-slate-500">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-blue-600">
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}
