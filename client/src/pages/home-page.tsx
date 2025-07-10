"use client";

import FeaturesCard from "@/components/features-card";
import Chatpage from "./chat-page";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useRef, useEffect } from "react";

function Homepage() {
  const [open, setOpen] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              delay: 0.6, // Delay only for appearing
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              transition: {
                duration: 0.2,
                ease: "easeIn",
                // No delay for exit
              },
            }}
            className="max-lg:hidden fixed inset-0 bg-background/20 backdrop-blur-md z-50 p-10 flex items-center justify-center"
          >
            <div ref={dialogRef} className="h-full flex items-center justify-center">
              <FeaturesCard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Chatpage />
    </>
  );
}

export default Homepage;
