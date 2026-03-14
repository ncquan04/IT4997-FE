import { useEffect } from "react";
import { motion } from "framer-motion";

interface ToastProps {
  title: string;
  type: "success" | "error";
  onClose: () => void;
}

const Toast = ({ title, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-9999 flex items-start justify-center pt-10 bg-black/50"
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
        className={`px-8 py-4 rounded-lg shadow-2xl text-white font-bold text-lg min-w-[300px] text-center ${
          type === "success" ? "bg-green-600" : "bg-red-600"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {title}
      </motion.div>
    </motion.div>
  );
};

export default Toast;
