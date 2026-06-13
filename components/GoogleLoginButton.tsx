"use client";

import Image from "next/image";

import { supabase } from "@/lib/supabase";

interface GoogleLoginButtonProps {
  label?: string;
  redirectTo?: string | null;
}

export default function GoogleLoginButton({
  label = "Đăng nhập bằng Google",
  redirectTo,
}: GoogleLoginButtonProps) {
  const login = async () => {
    const safeRedirectTo =
      redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
        ? redirectTo
        : "/home";

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${safeRedirectTo}`,
      },
    });
  };

  return (
    <button
      type="button"
      onClick={login}
      className="
        mt-4
        flex
        w-full
        items-center
        justify-center
        gap-3
        rounded-xl
        border
        border-slate-200
        py-3
        transition
        hover:bg-slate-50
      "
    >
      <Image src="/google.svg" alt="Google" width={20} height={20} />
      {label}
    </button>
  );
}
