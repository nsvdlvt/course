"use client";

import { supabase } from "@/lib/supabase";

export default function GoogleLoginButton() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });
  };

  return (
    <button
      onClick={login}
      className="
        w-full
        flex
        mt-4
        items-center
        justify-center
        gap-3
        border
        border-slate-200
        rounded-xl
        py-3
        hover:bg-slate-50
      "
    >
      <img
        src="/google.svg"
        alt="Google"
        className="w-5 h-5"
      />

      Đăng nhập bằng Google
    </button>
  );
}