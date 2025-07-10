import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const questions = [
  {
    q: "What is J.A.C.A.?",
    a: "I'm a friendly, enthusiastic AI assistant created to help you with anything from coding challenges to random curiosities. I might be 'just another' chat app on the surface, but I've got personality and practical help in spades. Oh, and I love a good conversation!",
    i: "/assets/images/home.png",
  },
  {
    q: "RAG support",
    a: "I can process PDFs, DOCX files, text documents, and even images with ease! Whether you need to extract insights from a technical manual, analyze a project proposal, or interpret a screenshot with text, I've got you covered.",
    i: "/assets/images/rag.png",
  },
  {
    q: "Web Search",
    a: "Whether you're debugging an issue or researching new technologies, I'll do my best to provide fresh, relevant information while keeping our conversation grounded in your needs.",
    i: "/assets/images/web.png",
  },
  {
    q: "Personalization",
    a: "Whether it's setting your preferred name, specifying your role (student, engineer, etc.), or sharing quirks I should know about, this feature ensures our chats feel for you. Imagine me referencing your projects or adjusting my tone to match your vibe - that's the magic!",
    i: "/assets/images/personalization.png",
  },
  {
    q: "Global Search",
    a: "This feature lets you search through all our past chats like a time machine, jump to any site page instantly, and perform actions directly. Think of it as having a smart, always-on assistant for your digital workflow that makes multitasking feel like magic!",
    i: "/assets/images/global.png",
  },
];

function FeaturesCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalItems = questions.length;
  const angleStep = 360 / totalItems;
  const radius = 460; // Distance from center

  const startIntervals = () => {
    clearIntervals();

    intervalRef.current = setInterval(() => {
      setActiveIndex((x) => (x + 1) % questions.length);
      setProgress(0);
    }, 4000);

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 40);
  };

  const clearIntervals = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  useEffect(() => {
    startIntervals();
    return () => {
      clearIntervals();
    };
  }, []);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
    startIntervals(); // Restart the timers
  };

  return (
    <Card className="w-full max-w-7xl h-fit lg:h-full border-primary/12 overflow-hidden relative">
      <CardHeader>
        <CardTitle>
          <motion.h1
            className="font-newsreader text-4xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Introducing : J.A.C.A. - Just Another Chat Application
          </motion.h1>
        </CardTitle>
      </CardHeader>

      <CardContent className="grid lg:grid-cols-2 h-full gap-8">
        <div className="h-full w-full flex items-center">
          <motion.ul layout className="space-y-6 flex-1">
            {questions.map((question, i) => (
              <motion.li
                key={question.q}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
                className="relative"
              >
                <motion.button
                  animate={{
                    scale: activeIndex === i ? 1.02 : 1,
                    opacity: activeIndex === i ? 1 : 0.7,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                  }}
                  className="relative text-left"
                  onClick={() => handleItemClick(i)}
                >
                  <motion.p
                    className={cn(
                      "font-newsreader text-xl font-[600] mb-2",
                      activeIndex === i ? "text-primary" : "inherit"
                    )}
                    transition={{ duration: 0.3 }}
                  >
                    {question.q}
                  </motion.p>

                  {/* Progress bar for active question */}

                  <AnimatePresence mode="popLayout">
                    {activeIndex === i && (
                      <motion.div
                        key={`${question.a}-${i}`}
                        initial={{
                          opacity: 0,
                          y: 15,
                          filter: "blur(4px)",
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          filter: "blur(0px)",
                        }}
                        exit={{
                          opacity: 0,
                          y: -15,
                          filter: "blur(4px)",
                        }}
                        transition={{
                          duration: 0.5,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="overflow-hidden"
                      >
                        <motion.p
                          className="text-muted-foreground leading-relaxed"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          {question.a}
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Active indicator */}

                {activeIndex === i && (
                  <motion.div
                    className="h-0.5 mt-3 rounded-full relative"
                    transition={{ duration: 0.1, ease: "linear" }}
                  >
                    <motion.div
                      className="absolute inset-y-0 my-auto w-2 h-2 bg-blue-500 rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: activeIndex === i ? 1 : 0,
                        opacity: activeIndex === i ? 1 : 0,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                    />

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-0.5 bg-blue-500 rounded-full"
                      transition={{ duration: 0.1, ease: "linear" }}
                    />
                  </motion.div>
                )}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* <DonutCarousel /> */}
        <div className="max-lg:hidden h-full w-full relative p-4">
          <div
            className="relative w-full h-full transition-transform duration-700 ease-in-out translate-x-5/6"
            style={{
              transform: `rotate(${-activeIndex * angleStep - 90}deg)`,
            }}
          >
            {questions.map((q, i) => {
              const angle = i * angleStep * (Math.PI / 180); // Convert to radians
              const x = Math.sin(angle) * radius;
              const y = -Math.cos(angle) * radius; // Negative because CSS y-axis is inverted
              const isActive = i === activeIndex;
              const randomRotation =
                ((Math.sin(activeIndex * 13 + i * 17) + 1) / 2) * 40 - 20;

              return (
                <div
                  key={q.q}
                  className="h-100 w-100 bg-background rounded-xl border-2 absolute cursor-pointer transition-all duration-700 delay-100 overflow-hidden"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: `translate(-50%, -50%) rotate(${
                      activeIndex * angleStep +
                      90 +
                      (isActive ? randomRotation : 0)
                    }deg)`, // Counter-rotate to keep items upright
                    zIndex: isActive ? 10 : 0,
                    opacity: isActive ? 1 : 0.3,
                  }}
                  onClick={() => handleItemClick(i)}
                >
                  <div
                    style={{
                      transform: `rotate(${isActive ? -randomRotation : 0}deg)`,
                    }}
                    className="h-full w-full transition-all duration-700"
                  >
                    <img
                      src={q.i}
                      className="w-full h-full object-cover object-center scale-120"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      {/* Background grid with enhanced animation */}
      <motion.div
        className="absolute -inset-1 -z-1 h-full w-full bg-[linear-gradient(to_right,#55a5fa22_1px,transparent_1px),linear-gradient(to_bottom,#55a5fa22_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_0%_100%,#000_70%,transparent_100%)]"
        animate={{
          backgroundPosition: [`0px 0px`, `40px 40px`],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    </Card>
  );
}

export default FeaturesCard;
