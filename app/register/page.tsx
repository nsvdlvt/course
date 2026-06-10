// app/register/page.tsx
import Link from "next/link";
import { User, Mail, Lock } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-black text-center">
          Đăng ký tài khoản
        </h1>


        <div className="my-6 text-center text-slate-400">
          
        </div>

        <form className="space-y-4">
          <input
            placeholder="Họ và tên"
            autoComplete="name"
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Tên đăng nhập"
            autoComplete="username"
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Email"
            autoComplete="email"
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            type="password"
            autoComplete="new-password"
            placeholder="Mật khẩu"
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            className="w-full border rounded-xl px-4 py-3"
          />

          <button
            className="
              w-full
              bg-blue-600
              text-white
              py-3
              rounded-xl
            "
          >
            Đăng ký
          </button>
        </form>
<button
  className="
    w-full
    mt-4
    flex
    items-center
    justify-center
    gap-3
    border
    border-slate-200
    rounded-xl
    py-3
    hover:bg-slate-50
    transition
  "
>
  <img
    src="https://www.svgrepo.com/show/475656/google-color.svg"
    alt="Google"
    className="w-5 h-5"
  />
  Đăng ký bằng Google
</button>
        <p className="text-center mt-6">
          Đã có tài khoản?{" "}
          <Link
            href="/"
            className="text-blue-600"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}