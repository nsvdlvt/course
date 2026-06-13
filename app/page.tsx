import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Background blur */}
      <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-10 left-10 animate-pulse" />
      <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse" />

      <div className="relative text-center px-6 animate-[fadeIn_1.2s_ease-out]">
        <p className="text-blue-400 font-medium tracking-widest uppercase mb-4">
          Developed by NSVD
        </p>

        <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-6">
          Welcome to
          <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            NSVDCourse
          </span>
        </h1>

        <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Learn smarter, more economically, and more effectively
        </p>

        <Link
  href="/home"
  className="px-8 py-4 rounded-2xl bg-white text-black font-semibold text-lg hover:scale-105 transition duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
>
  Get Started →
</Link>
      </div>
    </main>
  );
}