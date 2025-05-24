
"use client";

import type { User, UserRole } from "@/types";
import type { LoginSchema, SignupSchema } from "@/lib/schemas";
import type { z } from "zod";
import React, { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: z.infer<typeof LoginSchema>) => Promise<void>;
  signup: (data: z.infer<typeof SignupSchema>) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: Record<string, User> = {
  "hospital@example.com": { id: "1", name: "City General Hospital", email: "hospital@example.com", role: "hospital", avatar: "https://placehold.co/100x100.png", hospitalId: "hosp1" },
  "prof@example.com": { id: "2", name: "Dr. Alex Professional", email: "prof@example.com", role: "professional", avatar: "https://placehold.co/100x100.png" },
  "provider@example.com": { id: "3", name: "Tech Solutions Inc.", email: "provider@example.com", role: "provider", avatar: "https://placehold.co/100x100.png" },
  "admin@example.com": { id: "4", name: "Admin User", email: "admin@example.com", role: "admin", avatar: "https://placehold.co/100x100.png" },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("yura-connect-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("yura-connect-user");
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: z.infer<typeof LoginSchema>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const foundUser = Object.values(MOCK_USERS).find(u => u.email === data.email);
    
    if (foundUser) { // In a real app, you'd also check the password
      setUser(foundUser);
      localStorage.setItem("yura-connect-user", JSON.stringify(foundUser));
      router.push("/dashboard");
    } else {
      throw new Error("Invalid credentials");
    }
    setIsLoading(false);
  }, [router]);

  const signup = useCallback(async (data: z.infer<typeof SignupSchema>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    if (MOCK_USERS[data.email]) {
      throw new Error("User already exists");
    }
    const newUser: User = {
      id: String(Object.keys(MOCK_USERS).length + 1),
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      avatar: "https://placehold.co/100x100.png",
      ...(data.role === "hospital" && { hospitalId: `hosp${Object.keys(MOCK_USERS).length + 1}`})
    };
    // MOCK_USERS[newUser.email] = newUser; // In a real app, this would be a DB operation
    setUser(newUser);
    localStorage.setItem("yura-connect-user", JSON.stringify(newUser));
    router.push("/dashboard");
    setIsLoading(false);
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("yura-connect-user");
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
