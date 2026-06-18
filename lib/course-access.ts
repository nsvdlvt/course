import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function getCurrentUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id || null;
}

export async function getAccessibleCourseIds(userId: string | null) {
  if (!userId) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("user_courses")
    .select("course_id")
    .eq("user_id", userId);

  return (data || []).map((item) => item.course_id as string);
}

export async function canAccessCourse(courseId: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return false;
  }

  const courseIds = await getAccessibleCourseIds(userId);
  return courseIds.includes(courseId);
}
