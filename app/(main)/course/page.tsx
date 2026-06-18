"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import CourseCard from "../components/CourseCard";

export const dynamic = "force-dynamic";

interface Course {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  description: string | null;
}

export default function CoursePage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCourses() {
      try {
        setLoading(true);
        setMessage("");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!mounted) return;
          setCourses([]);
          setMessage("Bạn chưa đăng nhập.");
          return;
        }

        const { data: accessRows, error: accessError } = await supabase
          .from("user_courses")
          .select("course_id")
          .eq("user_id", user.id);

        if (accessError) {
          throw accessError;
        }

        const courseIds = (accessRows || []).map((item) => item.course_id as string);

        if (courseIds.length === 0) {
          if (!mounted) return;
          setCourses([]);
          setMessage("Bạn chưa được cấp quyền vào khóa học nào.");
          return;
        }

        const { data: courseRows, error: coursesError } = await supabase
          .from("courses")
          .select("id,title,slug,image,description")
          .in("id", courseIds)
          .order("title");

        if (coursesError) {
          throw coursesError;
        }

        if (!mounted) return;
        setCourses((courseRows || []) as Course[]);
      } catch (error) {
        if (!mounted) return;
        setCourses([]);
        setMessage(error instanceof Error ? error.message : "Không tải được khóa học.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadCourses();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fbff_0%,#eef9f6_48%,#fff7ed_100%)]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="mb-10 sm:mb-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-cyan-700">
            Danh sách khóa học
          </p>

          <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-900 sm:text-6xl">
            Chọn khóa học phù hợp với mục tiêu của bạn
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Chỉ những khóa học được admin cấp quyền mới xuất hiện tại đây.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Đang tải khóa học...
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            {message || "Bạn chưa được cấp quyền vào khóa học nào."}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                image={course.image ? `/${course.image}` : "/logo.png"}
                href={`/course/${course.slug}`}
                description={course.description || ""}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
