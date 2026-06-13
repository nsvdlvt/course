"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpenCheck } from "lucide-react";

interface Props {
  title: string;
  image: string;
  href: string;
  description: string;
}

export default function CourseCard({
  title,
  image,
  href,
  description,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);

    setTimeout(() => {
      router.push(href);
    }, 250);
  };

  return (
    <motion.div
      whileHover={{
        y: -6,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={handleClick}
      className={`
        group
        relative
        cursor-pointer
        overflow-hidden
        rounded-[2rem]
        border
        border-white/80
        bg-white/80
        p-5
        shadow-[0_18px_45px_rgba(15,23,42,0.08)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:border-cyan-200
        hover:shadow-[0_24px_60px_rgba(14,116,144,0.14)]
        ${
          loading
            ? "scale-[0.98] brightness-105 shadow-[0_18px_70px_rgba(14,116,144,0.22)]"
            : ""
        }
      `}
    >
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-28
          bg-gradient-to-r
          from-cyan-100/80
          via-sky-50
          to-amber-100/70
          opacity-80
          transition
          duration-500
          group-hover:opacity-100
        "
      />

      <div className="relative z-10 flex h-full flex-col">
        <div
          className="
            mb-6
            flex
            aspect-[16/10]
            items-center
            justify-center
            rounded-[1.5rem]
            border
            border-white/80
            bg-white/75
            p-8
            shadow-inner
          "
        >
          <Image
            src={image}
            alt={title}
            width={220}
            height={160}
            className="
              max-h-32
              w-auto
              rounded-2xl
              object-contain
              transition
              duration-300
              group-hover:scale-105
            "
          />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-700">
            <BookOpenCheck size={18} />
            <span>Khóa học</span>
          </div>

          <h2 className="text-3xl font-black leading-tight text-slate-900">
            {title}
          </h2>

          <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
            {description}
          </p>

          <div className="mt-7 flex items-center justify-between border-t border-slate-200/70 pt-5">
            <span className="text-sm font-semibold text-slate-500">
              Vào học ngay
            </span>

            <span
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-slate-900
                text-white
                transition
                duration-300
                group-hover:translate-x-1
                group-hover:bg-cyan-600
              "
            >
              <ArrowRight size={20} />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
