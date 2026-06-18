import UserCourseManager from "@/components/admin/UserCourseManager";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type AdminUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  role: string | null;
};

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: courses, error: coursesError }, { data: userCourses, error: userCoursesError }, usersResult] =
    await Promise.all([
      supabase.from("courses").select("id,title").order("title"),
      supabase.from("user_courses").select("user_id,course_id"),
      supabase.rpc("get_admin_users"),
    ]);

  const users = ((usersResult?.data || []) as AdminUserRow[]).filter((user) => user.email);

  const assignments = (userCourses || []).reduce(
    (acc: Record<string, string[]>, item: { user_id: string; course_id: string }) => {
      acc[item.user_id] = [...(acc[item.user_id] || []), item.course_id];
      return acc;
    },
    {}
  );

  const errorMessage =
    coursesError?.message || userCoursesError?.message || usersResult?.error?.message || "";

  return (
    <div>
      <h1 className="mb-8 text-4xl font-black">Quản lý người dùng</h1>
      <p className="mb-6 text-slate-500">
        Chọn khóa học cho từng người dùng. Người dùng chỉ thấy các khóa học được cấp quyền.
      </p>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          Không tải được danh sách người dùng: {errorMessage}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Chưa lấy được người dùng nào từ Supabase.
        </div>
      ) : (
        <UserCourseManager users={users} courses={courses || []} assignments={assignments} />
      )}
    </div>
  );
}
