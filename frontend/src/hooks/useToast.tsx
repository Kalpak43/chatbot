import React, { createContext, useContext, useState } from "react";

interface ToastType {
  content: string;
  type: "none" | "error" | "success" | "loading";
}

interface ToastContextType {
  toastDetails: ToastType;
  showToast: (content: string, type: ToastType["type"]) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastDetails, setToastDetails] = useState<ToastType>({
    content: "",
    type: "none",
  });

  const showToast = (content: string, type: ToastType["type"]) => {
    setToastDetails({ content, type });

    if (type !== "loading") {
      setTimeout(() => {
        setToastDetails({ content: "", type: "none" });
      }, 3000);
    }
  };

  return (
    <ToastContext.Provider value={{ toastDetails, showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useMessenger must be used within a MessengerProvider");
  }
  return context;
}
