import Link from "next/link";
import { Home, ArrowLeft, SearchX } from "lucide-react";
import BackButton from "@/components/BackButton";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-fuchsia-50 px-6">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-red-100">
          <SearchX
            size={50}
            className="text-red-500"
          />
        </div>

        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-red-500">
          Error 404
        </p>

        <h1 className="text-5xl font-black text-slate-900 sm:text-6xl">
          Không tìm thấy trang
        </h1>

        <p className="mt-5 text-lg text-slate-600">
          Trang bạn đang tìm kiếm có thể đã bị xoá,
          đổi địa chỉ hoặc không tồn tại.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/home"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-blue-600
              px-6
              py-4
              font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            <Home size={18} />
            Về trang chủ
          </Link>

          <BackButton href="/home" />
        </div>
      </div>
    </main>
  );
}
