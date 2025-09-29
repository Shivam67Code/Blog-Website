import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, AuthContextType } from "../../types";
import { userAPI } from "../../services/api";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      userAPI
        .getCurrentUser()
        .then((res) => setUser(res.data.data))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: { email?: string; username?: string; password: string }) => {
    setLoading(true);
    try {
      const res = await userAPI.login(credentials);
      localStorage.setItem("token", res.data.data.accessToken);
      setUser(res.data.data.user);
      toast.success("Logged in successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: FormData) => {
    setLoading(true);
    try {
      const res = await userAPI.register(formData);
      localStorage.setItem("token", res.data.data.accessToken);
      setUser(res.data.data);
      toast.success("Registered successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await userAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      toast.success("Logged out successfully!");
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);