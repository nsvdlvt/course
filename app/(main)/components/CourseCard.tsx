"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  title: string;
  image: string;
  href: string;
  color: string;
  description: string;
}

export default function CourseCard({
  title,
  image,
  href,
  color,
  description,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);

    setTimeout(() => {
      router.push(href);
    }, 350);
  };

  return (
    <motion.div
      whileHover={{
        scale: 1.04,
        y: -8,
      }}
      whileTap={{
        scale: 0.96,
      }}
      onClick={handleClick}
      className={`
        cursor-pointer
        rounded-3xl
        bg-white/60 backdrop-blur-xl
        p-10
        shadow-[0_10px_40px_rgba(0,0,0,0.15)]
        transition-all
        border
        overflow-hidden
        relative

        ${
          loading
            ? "scale-95 brightness-110 shadow-[0_0_80px_rgba(59,130,246,.5)]"
            : ""
        }
      `}
    >
      <div
        className={`absolute inset-0 opacity-0 hover:opacity-100 transition duration-500 bg-gradient-to-br ${color}`}
      />

      <div className="relative z-10">
        <div className="flex justify-center mb-6">
          <Image
            src={image}
            alt={title}
            width={180}
            height={180}
            className="object-contain transition duration-300 hover:scale-110"
          />
        </div>

        <h2 className="text-4xl font-bold text-center mb-3">
          {title}
        </h2>

        <p className="text-center text-gray-500">
          {description}
        </p>
      </div>
    </motion.div>
  );
}