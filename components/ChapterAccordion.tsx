"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface ChapterAccordionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: "root" | "nested";
}

export default function ChapterAccordion({
  title,
  subtitle,
  children,
  defaultOpen = false,
  variant = "root",
}: ChapterAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isNested = variant === "nested";

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div
          className={`absolute left-0 top-0 h-full ${
            isNested ? "w-1 bg-cyan-400/80" : "w-1.5 bg-gradient-to-b from-cyan-500 to-blue-600"
          }`}
        />
        <div
          className={`absolute inset-0 ${
            isNested
              ? "bg-gradient-to-r from-cyan-50 via-white to-slate-50"
              : "bg-gradient-to-r from-slate-50 via-white to-slate-100"
          }`}
        />

        <div className="relative flex-1 pl-2">
          <h2 className={isNested ? "text-lg font-semibold text-slate-700" : "text-xl font-bold text-slate-800"}>
            {title}
          </h2>
          {subtitle && (
            <p className={isNested ? "mt-1 text-sm text-cyan-700/80" : "mt-1 text-sm text-slate-500"}>
              {subtitle}
            </p>
          )}
        </div>

        <motion.div
          className="relative"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown size={22} className={isNested ? "text-cyan-700" : "text-slate-500"} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={isNested ? "bg-cyan-50/40 p-4" : "bg-white p-4"}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
