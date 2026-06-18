"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface ChapterAccordionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function ChapterAccordion({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: ChapterAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-md
        transition-all
        duration-300
        hover:shadow-xl
      "
    >
      <button
        onClick={() => setOpen(!open)}
        className="
          relative
          flex
          w-full
          items-center
          justify-between
          px-6
          py-4
          text-left
          bg-gradient-to-r
          from-slate-50
          via-white
          to-slate-100
        "
      >
        {/* Thanh màu bên trái */}
        <div
          className="
            absolute
            left-0
            top-0
            h-full
            w-1.5
            bg-gradient-to-b
            from-cyan-500
            to-blue-600
          "
        />

        <div className="flex-1 pl-2">
          <h2 className="text-xl font-bold text-slate-800">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <motion.div
          animate={{
            rotate: open ? 180 : 0,
          }}
          transition={{
            duration: 0.25,
          }}
        >
          <ChevronDown
            size={22}
            className="text-slate-500"
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.35,
              ease: "easeInOut",
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{
                y: -10,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -10,
                opacity: 0,
              }}
              transition={{
                duration: 0.25,
              }}
              className="bg-white p-4"
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
