// app/page.tsx
import Link from "next/link";
import { Mail, Lock, Shield} from "lucide-react";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-black text-center">
          NSVDCourse
        </h1>

        <p className="text-center text-slate-500 mt-2">
          Đăng nhập để tiếp tục
        </p>

        

        <div className="my-6 text-center text-slate-400">
          
        </div>

        <form className="space-y-4">
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-4 text-slate-400"
            />

            <input
              type="text"
              autoComplete="username"
              placeholder="Email hoặc tên đăng nhập"
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                pl-11
                py-3
                outline-none
                focus:border-blue-500
              "
            />
          </div>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-4 text-slate-400"
            />

            <input
              type="password"
              autoComplete="current-password"
              placeholder="Mật khẩu"
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                pl-11
                py-3
                outline-none
                focus:border-blue-500
              "
            />
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-blue-600 text-sm"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            className="
              w-full
              rounded-xl
              bg-blue-600
              text-white
              py-3
              font-semibold
              hover:bg-blue-700
            "
          >
            Đăng nhập
          </button>
        </form>
  <GoogleLoginButton />

        <p className="text-center mt-6 text-slate-500">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-medium"
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </main>
  );
}