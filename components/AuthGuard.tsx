"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type AuthGuardProps = {
  children: ReactNode;
  adminOnly?: boolean;
};

export default function AuthGuard({ children, adminOnly = false }: AuthGuardProps) {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    const redirectToLogin = () => {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
    };

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (!session) {
        redirectToLogin();
        return;
      }

      if (adminOnly) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (!mounted) {
          return;
        }

        if (profile?.role !== "admin") {
          router.replace("/home");
          return;
        }
      }

      setCheckingSession(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) {
        return;
      }

      if (event === "SIGNED_OUT" || !session) {
        redirectToLogin();
        return;
      }

      if (adminOnly) {
        void checkSession();
        return;
      }

      setCheckingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [adminOnly, router]);

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 text-sm font-medium text-slate-500">
        Đang kiểm tra đăng nhập...
      </main>
    );
  }

  return children;
}
