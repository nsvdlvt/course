import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function CoursesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("title");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black">
            Quản lý khóa học
          </h1>

          <p className="text-slate-500 mt-2">
            Danh sách các khóa học hiện có
          </p>
        </div>

        <Link
          href="/admin/courses/new"
          className="
            flex
            items-center
            gap-2
            bg-blue-600
            text-white
            px-5
            py-3
            rounded-xl
          "
        >
          <Plus size={18} />
          Thêm khóa học
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-5">
                Tên khóa học
              </th>

              <th className="text-left p-5">
                Slug
              </th>

              <th className="text-right p-5">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {(courses || []).map((course) => (
              <tr
                key={course.id}
                className="border-t"
              >
                <td className="p-5 font-medium">
                  {course.title}
                </td>

                <td className="p-5 text-slate-500">
                  {course.slug}
                </td>

                <td className="p-5">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="
                        p-2
                        rounded-lg
                        hover:bg-slate-100
                      "
                    >
                      <Pencil size={18} />
                    </Link>

                    <button
                      className="
                        p-2
                        rounded-lg
                        text-red-500
                        hover:bg-red-50
                      "
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
