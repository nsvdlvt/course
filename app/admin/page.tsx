export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-4xl font-black mb-8">
        Dashboard
      </h1>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow">
          <h2 className="text-slate-500">
            Người dùng
          </h2>

          <p className="text-4xl font-black mt-2">
            0
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <h2 className="text-slate-500">
            Khóa học
          </h2>

          <p className="text-4xl font-black mt-2">
            0
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <h2 className="text-slate-500">
            Bài học
          </h2>

          <p className="text-4xl font-black mt-2">
            0
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <h2 className="text-slate-500">
            Tài liệu
          </h2>

          <p className="text-4xl font-black mt-2">
            0
          </p>
        </div>
      </div>
    </div>
  );
}