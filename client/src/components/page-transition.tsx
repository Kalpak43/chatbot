"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    scale: 1,
  },
  out: {
    opacity: 0,
    scale: 0.98,
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
};

export default function PageTransition({
  children,
  className = "",
}: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={cn("w-full h-full flex flex-col", className)}
    >
      {children}
    </motion.div>
  );
}
