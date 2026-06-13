import { supabase } from "@/lib/supabase";
import CourseCard from "../components/CourseCard";

interface Course {
  id: string;
  title: string;
  slug: string;
  image: string;
  description: string;
}

export default async function CoursePage() {
  const { data: courses } = await supabase.from("courses").select("*");

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
            Bắt đầu từ môn bạn muốn học, vào chương và học tiếp từng bài theo
            lộ trình đã sắp xếp.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {(courses as Course[] | null)?.map((course) => (
            <CourseCard
              key={course.id}
              title={course.title}
              image={`/${course.image}`}
              href={`/course/${course.slug}`}
              description={course.description}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
