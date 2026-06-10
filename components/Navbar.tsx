"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  BookText,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItem = (
    href: string,
    label: string,
    Icon: any
  ) => {
    let active = false;

    if (href === "/") {
      active = pathname === "/";
    } else if (href === "/home") {
      active =
        pathname.startsWith("/home") ||
        pathname.startsWith("/course") ||
        pathname.startsWith("/dashboard/course");
    } else {
      active = pathname.startsWith(href);
    }

    return (
      <Link
        href={href}
        className={`
          flex
          items-center
          gap-2
          rounded-xl
          px-4
          py-2
          transition-all
          duration-200

          ${
            active
              ? "bg-blue-100 text-blue-700 font-semibold shadow-sm"
              : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
          }
        `}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        border-slate-200/70
        bg-white/80
        backdrop-blur-xl
      "
    >
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/home"
          className="flex items-center gap-3 group"
        >
          <div
            className="
              h-11
              w-11
              rounded-2xl
              bg-gradient-to-br
              from-blue-500
              via-indigo-500
              to-purple-600
              flex
              items-center
              justify-center
              text-white
              shadow-lg
              transition-all
              duration-300
              group-hover:scale-105
            "
          >
            <BookText size={22} />
          </div>

          <div>
            <h1 className="font-extrabold text-lg text-slate-800 leading-none">
              NSVDCourse
            </h1>

            <p className="text-xs text-slate-500">
              Aim30+THPTQG
            </p>
          </div>
        </Link>

        {/* Menu */}
        <nav className="flex items-center gap-2">
          {navItem(
            "/",
            "Trang chủ",
            LayoutDashboard
          )}

          {navItem(
            "/course",
            "Khóa học",
            BookOpen
          )}

          {navItem(
            "/documents",
            "Tài liệu",
            FileText
          )}
        </nav>
      </div>
    </header>
  );
}