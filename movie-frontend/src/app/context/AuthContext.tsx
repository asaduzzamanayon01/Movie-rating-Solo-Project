"use client";
import { createContext, useState, ReactNode } from "react";

interface AuthContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);

  return (
    <AuthContext.Provider value={{ loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
