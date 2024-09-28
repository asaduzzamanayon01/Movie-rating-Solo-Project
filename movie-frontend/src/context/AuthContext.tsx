"use client";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";

interface AuthContextType {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  isAuthenticated: boolean;
  isLogedIn: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  setIsLogedIn: Dispatch<SetStateAction<boolean>>;
  user: { firstName: string } | null;
  setUser: Dispatch<SetStateAction<{ firstName: string } | null>>;
  handleLogin: (token: string, firstName: string) => void;
  handleLogout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ firstName: string } | null>(null);
  const [isLogedIn, setIsLogedIn] = useState(false);
  const pathname = usePathname();

  const checkAuth = () => {
    const token = Cookies.get("token");
    const firstName = Cookies.get("firstName");

    if (token && firstName) {
      setIsAuthenticated(true);
      setIsLogedIn(true);
      setUser({ firstName });
    } else {
      setIsAuthenticated(false);
      setIsLogedIn(false);
      setUser(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const handleLogin = (token: string, firstName: string) => {
    Cookies.set("token", token);
    Cookies.set("firstName", firstName);
    setIsAuthenticated(true);
    setIsLogedIn(true);
    setUser({ firstName });
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("firstName");
    Cookies.remove("userId");
    setIsAuthenticated(false);
    setIsLogedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        isAuthenticated,
        isLogedIn,
        setIsAuthenticated,
        setIsLogedIn,
        user,
        setUser,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
