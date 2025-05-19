
import { motion } from "motion/react";

function TypingIndicator({ id }: { id: string }) {
  const typingIndicator = {
    animate: {
      transition: {
        staggerChildren: 0.2,
        repeat: Infinity,
        repeatType: "loop" as "loop",
      },
    },
  };

  const dotBounce = {
    initial: { y: 0 },
    animate: {
      y: [0, -6, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div key={id} className="flex gap-2">
      <motion.div
        className="flex gap-2"
        variants={typingIndicator}
        initial="initial"
        animate="animate"
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="size-2 rounded-full bg-[radial-gradient(at_25%_25%,white,black)]"
            variants={dotBounce}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default TypingIndicator;
