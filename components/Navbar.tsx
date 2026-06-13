"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  FileText,
  Home,
  KeyRound,
  LogOut,
  Menu,
  User,
  UserCircle,
  X,
  BookA,
  type LucideIcon,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type AccountProfile = {
  email: string;
  fullName: string | null;
  username: string | null;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [account, setAccount] = useState<AccountProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAccount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (!user?.email) {
        setAccount(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      setAccount({
        email: user.email,
        fullName:
          typeof profile?.full_name === "string" ? profile.full_name : null,
        username:
          typeof profile?.username === "string" ? profile.username : null,
      });
    };

    loadAccount();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadAccount();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAccount(null);
    setIsMenuOpen(false);
    setIsAccountMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const displayName =
    account?.fullName?.trim() ||
    account?.username?.trim() ||
    account?.email.split("@")[0] ||
    "";
  const avatarText = displayName.charAt(0).toUpperCase();
  const getLoginHref = () => {
    const currentPath = `${window.location.pathname}${window.location.search}`;
    return `/login?redirectTo=${encodeURIComponent(currentPath)}`;
  };

  const accountPanel = account ? (
    <div className="relative min-w-0">
      <button
        type="button"
        aria-label="Mở menu tài khoản"
        aria-expanded={isAccountMenuOpen}
        onClick={() => setIsAccountMenuOpen((current) => !current)}
        className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {avatarText}
        </div>

        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-semibold text-slate-800">
            {displayName}
          </p>
          <p className="truncate text-xs text-slate-500">{account.email}</p>
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-500 transition ${
            isAccountMenuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isAccountMenuOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
          <Link
            href="/profile"
            onClick={() => {
              setIsMenuOpen(false);
              setIsAccountMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <UserCircle size={18} />
            <span>Thông tin cá nhân</span>
          </Link>

          <Link
            href="/reset-password"
            onClick={() => {
              setIsMenuOpen(false);
              setIsAccountMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <KeyRound size={18} />
            <span>Mật khẩu</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  ) : (
    <Link
      href="/login"
      onClick={(event) => {
        event.preventDefault();
        setIsMenuOpen(false);
        router.push(getLoginHref());
      }}
      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      <User size={18} />
      <span>Đăng nhập</span>
    </Link>
  );

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
              overflow-hidden
              rounded-xl
              flex
              items-center
              justify-center
              transition-all
              duration-300
              group-hover:scale-105
            "
          >
            <Image
              src="/logo.png"
              alt="NSVDCourse"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />
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
        <div className="navbar-desktop-menu items-center gap-3">
          <nav className="flex items-center gap-2">{navItems}</nav>
          {accountPanel}
        </div>

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
            <div className="pt-2">{accountPanel}</div>
          </div>
        </nav>
      )}
    </header>
  );
}
