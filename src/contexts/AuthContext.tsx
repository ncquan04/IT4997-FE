import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../shared/models/user-model";

import AppStorage from "../storage";

import { authApi, type RegisterPayload } from "../services/api/api.auth";

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      const { user } = data;

      if (user) {
        AppStorage.set("user", user);
        setIsAuthenticated(true);
        setUser(user);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      AppStorage.remove("user");
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      await authApi.register(payload);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const storedUser = AppStorage.get("user");

    if (storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContextProvider;
