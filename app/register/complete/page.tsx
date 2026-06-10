// app/register/complete/page.tsx
export default function CompleteProfilePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center">
          Hoàn thiện hồ sơ
        </h1>

        <div className="space-y-4 mt-8">
          <input
            placeholder="Họ và tên"
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Tên đăng nhập"
            className="w-full border rounded-xl px-4 py-3"
          />

          <button
            className="
              w-full
              bg-blue-600
              text-white
              py-3
              rounded-xl
            "
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </main>
  );
}