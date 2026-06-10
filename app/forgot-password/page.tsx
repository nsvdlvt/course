// app/forgot-password/page.tsx

import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center">
          Quên mật khẩu
        </h1>

        <p className="text-slate-500 text-center mt-2">
          Nhập email để nhận liên kết đặt lại mật khẩu
        </p>

        <input
          type="email"
          placeholder="Email"
          className="
            w-full
            mt-6
            border
            border-slate-200
            rounded-xl
            px-4
            py-3
          "
        />

        <button
          className="
            w-full
            mt-4
            bg-blue-600
            text-white
            py-3
            rounded-xl
          "
        >
          Gửi liên kết
        </button>

        <Link
          href="/"
          className="
            block
            text-center
            mt-4
            text-blue-600
          "
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </main>
  );
}