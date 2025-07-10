import FeaturesCard from "@/components/features-card";
import Chatpage from "./chat-page";
import { motion } from "motion/react";

function Homepage() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.6 }}
        className="fixed inset-0 bg-background/20 backdrop-blur-md z-50 p-3 flex items-center justify-center"
      >
        <FeaturesCard />
      </motion.div>
      <Chatpage />
    </>
  );
}

export default Homepage;
