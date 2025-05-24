
"use client";

import type { User, UserRole } from "@/types";
import type { LoginSchema, SignupSchema, ProfileUpdateSchema } from "@/lib/schemas";
import type { z } from "zod";
import React, { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: z.infer<typeof LoginSchema>) => Promise<void>;
  signup: (data: z.infer<typeof SignupSchema>) => Promise<void>;
  logout: () => void;
  updateProfile: (data: z.infer<typeof ProfileUpdateSchema>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// MOCK_USERS needs to be accessible for updates if email changes, but for now, we simplify.
const MOCK_USERS_DB: Record<string, User> = {
  "hospital@example.com": { id: "hosp1", name: "City General Hospital", email: "hospital@example.com", role: "hospital", avatar: "https://placehold.co/100x100.png", hospitalId: "hosp1" },
  "prof@example.com": { id: "prof1", name: "Dr. Alex Professional", email: "prof@example.com", role: "professional", avatar: "https://placehold.co/100x100.png" },
  "provider@example.com": { id: "prov1", name: "Tech Solutions Inc.", email: "provider@example.com", role: "provider", avatar: "https://placehold.co/100x100.png", providerId: "prov1" },
  "admin@example.com": { id: "admin1", name: "Admin User", email: "admin@example.com", role: "admin", avatar: "https://placehold.co/100x100.png" },
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
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const foundUser = Object.values(MOCK_USERS_DB).find(u => u.email === data.email);
    
    if (foundUser) { 
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
    await new Promise(resolve => setTimeout(resolve, 500)); 
    if (MOCK_USERS_DB[data.email]) {
      throw new Error("User already exists");
    }
    const baseId = String(Object.keys(MOCK_USERS_DB).length + 1);
    const newUser: User = {
      id: `${data.role.substring(0,4)}${baseId}`, // e.g. hosp2, prof2
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      avatar: "https://placehold.co/100x100.png",
      ...(data.role === "hospital" && { hospitalId: `hosp${baseId}`}),
      ...(data.role === "provider" && { providerId: `prov${baseId}`})
    };
    // MOCK_USERS_DB[newUser.email] = newUser; // Add to our mock DB
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

  const updateProfile = useCallback(async (data: z.infer<typeof ProfileUpdateSchema>) => {
    if (!user) throw new Error("User not authenticated");
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    const oldEmail = user.email;
    const updatedUser = { 
      ...user, 
      name: data.name,
      email: data.email, // Assuming email can be changed. Real app needs verification.
      avatar: data.avatar || "https://placehold.co/100x100.png" // Default if empty
    };

    // Update MOCK_USERS_DB if email changed (key for the mock DB)
    // This is a simplified mock update. A real backend would handle this.
    if (data.email !== oldEmail && MOCK_USERS_DB[oldEmail]) {
      delete MOCK_USERS_DB[oldEmail];
      MOCK_USERS_DB[data.email] = updatedUser;
    } else if (MOCK_USERS_DB[data.email]) {
      MOCK_USERS_DB[data.email] = updatedUser;
    }
    
    setUser(updatedUser);
    localStorage.setItem("yura-connect-user", JSON.stringify(updatedUser));
    setIsLoading(false);
  }, [user]);


  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
