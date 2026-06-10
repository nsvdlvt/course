export default function NewCoursePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl font-black mb-8">
        Thêm khóa học
      </h1>

      <form className="bg-white p-8 rounded-3xl shadow space-y-5">
        <div>
          <label className="block mb-2">
            Tên khóa học
          </label>

          <input
            className="
              w-full
              border
              rounded-xl
              px-4
              py-3
            "
            placeholder="Vật Lí"
          />
        </div>

        <div>
          <label className="block mb-2">
            Slug
          </label>

          <input
            className="
              w-full
              border
              rounded-xl
              px-4
              py-3
            "
            placeholder="vatli"
          />
        </div>

        <button
          className="
            bg-blue-600
            text-white
            px-6
            py-3
            rounded-xl
          "
        >
          Lưu
        </button>
      </form>
    </div>
  );
}