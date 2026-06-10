import { supabase } from "@/lib/supabase";
import CourseCard from "../components/CourseCard";

export default async function HomePage() {
  const { data: courses } = await supabase
    .from("courses")
    .select("*");

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-100 via-fuchsia-100 to-orange-100">
      <div className="max-w-6xl mx-auto px-6 py-16">

        <div className="text-center mb-16">
          <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Chọn khóa học
          </h1>

          <p className="text-gray-700 text-xl">
            Bắt đầu hành trình chinh phục mục tiêu của bạn 🚀
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {courses?.map((course) => (
            <CourseCard
              key={course.id}
              title={course.title}
              image={`/${course.image}`}
              href={`/course/${course.slug}`}
              color="from-blue-300/20 to-purple-300/20"
              description={course.description}
            />
          ))}
        </div>
      </div>
    </main>
  );
}