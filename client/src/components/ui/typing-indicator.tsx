

import { motion, Variants } from "framer-motion"

function TypingIndicator({ id }: { id: string }) {
  const typingIndicator = {
    initial: {}, // Added missing initial state
    animate: {
      transition: {
        staggerChildren: 0.2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop" as const,
      },
    },
  }

  const dotBounce: Variants = {
    initial: { y: 0 },
    animate: {
      y: [0, -6, 0, 0, 0], // Added extra "0" values to create a pause
      transition: {
        times: [0, 0.3, 0.6, 0.8, 1], // Control the timing of each keyframe
        duration: 2, // Increased duration to accommodate the pause
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      },
    },
  }

  return (
    <div key={id} className="flex gap-2">
      <motion.div className="flex gap-2" variants={typingIndicator} initial="initial" animate="animate">
        {[...Array(3)].map((_, i) => (
          <motion.div key={i} className="size-2 rounded-full bg-gray-400 dark:bg-gray-600" variants={dotBounce} />
        ))}
      </motion.div>
    </div>
  )
}

export default TypingIndicator