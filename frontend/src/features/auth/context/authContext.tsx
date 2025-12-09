import { createContext, useState, useEffect } from "react";
import type { User, AuthContextType } from "../types/auth.types";

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuth: false,
  setIsAuth: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState<boolean>(
    () => localStorage.getItem("isAuth") === "true"
  );

  useEffect(() => {
    if (isAuth) {
      localStorage.setItem("isAuth", "true");
    } else {
      localStorage.removeItem("isAuth");
    }
  }, [isAuth]);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuth, setIsAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
