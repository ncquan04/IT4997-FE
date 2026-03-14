import type { ReactNode } from "react";
import AuthContextProvider from "./AuthContext";
import I18nContextProvider from "./I18nContext";
import { ToastContextProvider } from "./ToastContext";

const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ToastContextProvider>
      <AuthContextProvider>
        <I18nContextProvider>{children}</I18nContextProvider>
      </AuthContextProvider>
    </ToastContextProvider>
  );
};

export default AppProvider;
