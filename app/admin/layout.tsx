import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  LogOut,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black">
            Admin Console
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            NSVDCourse
          </p>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800"
          >
            <Users size={20} />
            Người dùng
          </Link>

          <Link
            href="/admin/courses"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800"
          >
            <BookOpen size={20} />
            Khóa học
          </Link>

          <Link
            href="/admin/documents"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800"
          >
            <FileText size={20} />
            Tài liệu
          </Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
      </div>
    </AuthGuard>
  );
}
