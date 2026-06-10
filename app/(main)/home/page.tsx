// app/(main)/home/page.tsx

"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      console.log(data.user);
    });
  }, []);

  return <h1>Home</h1>;
}