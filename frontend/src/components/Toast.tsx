import { motion, AnimatePresence } from "motion/react";
import { useToast } from "../hooks/useToast";
import { AlertCircle, Check, Loader2 } from "lucide-react";

function Toast() {
  const { toastDetails } = useToast();

  const getToastStyle = () => {
    switch (toastDetails.type) {
      case "success":
        return "alert alert-success";
      case "error":
        return "alert alert-error";
      case "loading":
        return "alert alert-info";
      default:
        return "alert";
    }
  };

  return (
    <AnimatePresence>
      {toastDetails.type !== "none" && (
        <motion.div
          initial={{ opacity: 0, x: 50 }} // Slide up animation
          animate={{ opacity: 1, x: 0 }} // Fade in
          exit={{ opacity: 0, x: 50 }} // Fade out and slide down
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`fixed top-0 max-md:left-0 right-0 z-50 m-2 ${getToastStyle()} max-md:mx-auto`}
        >
          <div className="flex items-center space-x-2">
            {toastDetails.type === "success" && <Check size={20} />}
            {toastDetails.type === "error" && <AlertCircle size={20} />}
            {toastDetails.type === "loading" && (
              <Loader2 className="animate-spin" size={20} />
            )}
            <span>{toastDetails.content}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
