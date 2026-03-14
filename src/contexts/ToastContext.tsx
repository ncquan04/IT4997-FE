import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import Toast from "../components/common/Toast";
import { AnimatePresence } from "framer-motion";

type ToastType = "success" | "error";

interface ToastContextType {
  showToast: (title: string, type: ToastType) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
});

export const ToastContextProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{
    title: string;
    type: ToastType;
    visible: boolean;
  }>({
    title: "",
    type: "success",
    visible: false,
  });

  const showToast = useCallback((title: string, type: ToastType) => {
    setToast({ title, type, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <AnimatePresence>
        {toast.visible && (
          <Toast title={toast.title} type={toast.type} onClose={hideToast} />
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
