"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  FileText,
  BookText,
  Home,
  Menu,
  X,
  BookA,
  type LucideIcon,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActivePath = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navItem = (
    href: string,
    label: string,
    Icon: LucideIcon
  ) => {
    const active = isActivePath(href);

    return (
      <Link
        href={href}
        onClick={() => setIsMenuOpen(false)}
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

  const navItems = (
    <>
      {navItem(
        "/home",
        "Trang chủ",
        Home
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

      {navItem(
        "https://vocab.nsvd.io.vn",
        "Học từ vựng",
        BookA
      )}
    </>
  );

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
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
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

        {/* Desktop menu */}
        <nav className="navbar-desktop-menu items-center gap-2">
          {navItems}
        </nav>

        <button
          type="button"
          aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
          className="
            navbar-menu-button
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            text-slate-700
            transition-all
            duration-200
            hover:bg-blue-50
            hover:text-blue-600
          "
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="navbar-mobile-menu border-t border-slate-200/70 bg-white/95 px-4 py-3 shadow-sm">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navItems}
          </div>
        </nav>
      )}
    </header>
  );
}
