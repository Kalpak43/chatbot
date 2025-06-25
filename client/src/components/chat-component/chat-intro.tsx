"use client";

import { useAppDispatch } from "@/app/hooks";
import { setPrompt } from "@/features/prompt/promptSlice";
import { Button } from "../ui/button";
import { useEffect } from "react";
import { motion } from "motion/react";

export function ChatIntro() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    document.title = "J.A.C.A. - Just Another Chat Application";
  }, []);

  const prompts = [
    "What can I cook with chicken, garlic, and rice?",
    "Can you explain quantum physics in simple terms?",
    "Help me write a professional email to my manager.",
    "What's a fun weekend activity near me?",
    "Can you summarize this article for me?",
  ];

  const handlePromptInput = (prompt: string) => {
    dispatch(setPrompt(prompt));
  };

  // Animation variants for staggered effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.1,
        ease: "easeOut",
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.1,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-full overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto px-4 md:px-8 flex flex-col justify-center h-full space-y-4">
        <motion.h1
          variants={titleVariants}
          className="text-3xl font-[500] font-newsreader"
        >
          Hello, What can I help you with?
        </motion.h1>
        <motion.ul
          variants={containerVariants}
          className="flex flex-col w-full divide-y divide-accent/60"
        >
          {prompts.map((prompt, _) => (
            <motion.li
              key={prompt}
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="ghost"
                className="w-full justify-start italic font-400 my-1"
                onClick={() => handlePromptInput(prompt)}
              >
                {prompt}
              </Button>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </motion.div>
  );
}
