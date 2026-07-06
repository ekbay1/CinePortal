"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { clearStoredToken, getStoredToken, saveToken } from "@/lib/auth-storage";
import { getCurrentUser, loginUser, signupUser } from "@/lib/api";
import type { LoginInput, SignupInput, User } from "@/types/auth";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserFromToken() {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(storedToken);
        setToken(storedToken);
        setUser(currentUser);
      } catch {
        clearStoredToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserFromToken();
  }, []);

  async function login(input: LoginInput) {
    const loginResponse = await loginUser(input);
    const accessToken = loginResponse.access_token;

    saveToken(accessToken);
    setToken(accessToken);

    const currentUser = await getCurrentUser(accessToken);
    setUser(currentUser);
  }

  async function signup(input: SignupInput) {
    await signupUser(input);

    await login({
      email: input.email,
      password: input.password,
    });
  }

  function logout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}