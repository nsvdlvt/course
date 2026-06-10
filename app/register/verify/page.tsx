// app/register/verify/page.tsx
export default function VerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center">
          Xác nhận Email
        </h1>

        <p className="text-center text-slate-500 mt-3">
          Nhập mã xác nhận gồm 6 chữ số
        </p>

        <input
          maxLength={6}
          placeholder="123456"
          className="
            w-full
            mt-6
            text-center
            text-3xl
            tracking-[0.5em]
            border
            rounded-xl
            py-4
          "
        />

        <button
          className="
            w-full
            mt-6
            bg-blue-600
            text-white
            py-3
            rounded-xl
          "
        >
          Xác nhận
        </button>
      </div>
    </main>
  );
}