"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

type UserItem = {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
};

type CourseItem = {
  id: string;
  title: string;
};

interface Props {
  users: UserItem[];
  courses: CourseItem[];
  assignments: Record<string, string[]>;
}

export default function UserCourseManager({ users, courses, assignments }: Props) {
  const router = useRouter();
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string[]>>(assignments);

  function toggleCourse(userId: string, courseId: string) {
    setSelected((current) => {
      const currentIds = current[userId] || [];
      const nextIds = currentIds.includes(courseId)
        ? currentIds.filter((id) => id !== courseId)
        : [...currentIds, courseId];

      return {
        ...current,
        [userId]: nextIds,
      };
    });
  }

  async function saveUserCourses(userId: string) {
    try {
      setSavingUserId(userId);

      const nextIds = selected[userId] || [];

      const { error: deleteError } = await supabase.from("user_courses").delete().eq("user_id", userId);
      if (deleteError) {
        alert(deleteError.message);
        return;
      }

      if (nextIds.length > 0) {
        const { error: insertError } = await supabase.from("user_courses").insert(
          nextIds.map((courseId) => ({
            user_id: userId,
            course_id: courseId,
          }))
        );

        if (insertError) {
          alert(insertError.message);
          return;
        }
      }

      alert("Đã lưu phân quyền khóa học");
      router.refresh();
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      {users.map((user) => {
        const checkedIds = new Set(selected[user.id] || []);
        const displayName = user.full_name || user.username || user.email;

        return (
          <div key={user.id} className="rounded-3xl bg-white p-6 shadow">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{displayName}</h2>
                <p className="text-slate-500">{user.email}</p>
              </div>

              <button
                type="button"
                onClick={() => saveUserCourses(user.id)}
                disabled={savingUserId === user.id}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {savingUserId === user.id ? "Đang lưu..." : "Lưu khóa học"}
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <label
                  key={course.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    checked={checkedIds.has(course.id)}
                    onChange={() => toggleCourse(user.id, course.id)}
                  />
                  <span className="font-medium text-slate-800">{course.title}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
