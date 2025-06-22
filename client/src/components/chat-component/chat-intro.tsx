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

  return (
    <motion.div
      
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto px-4 md:px-8 flex flex-col justify-center h-full space-y-4">
        <h1 className="text-3xl font-[500] font-newsreader">
          Hello, What can I help you with?
        </h1>
        <ul className="flex flex-col w-full divide-y divide-accent/60">
          {prompts.map((prompt) => (
            <li key={prompt}>
              <Button
                variant="ghost"
                className="w-full justify-start italic font-400 my-1"
                onClick={() => handlePromptInput(prompt)}
              >
                {prompt}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
