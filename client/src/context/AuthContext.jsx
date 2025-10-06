import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  loginUser,
  registerUser,
  refreshUser,
  getMe,
  logoutUser,
} from "@/api/authApi";
import { toast } from "sonner";
import { socket } from "@/socket"; // 👈 import socket

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/auth")) {
      setLoading(false);
      setUser(null);
      return;
    }
    const checkAuth = async () => {
      try {
        await refreshUser();
        const meRes = await getMe();
        setUser(meRes.data || null);
        // If authenticated, connect socket
        if (!socket.connected) {
          socket.connect();
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();

    const interval = setInterval(async () => {
      try {
        await refreshUser();
      } catch (error) {
        setUser(null);
      }
    }, 55 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const login = async (credentials) => {
    try {
      const res = await loginUser(credentials);
      setUser(res.data.user);
      // Connect socket after login to update online status
      if (!socket.connected) {
        socket.connect();
      }
      toast.success(res.message || "Logged in successfully!");
      return res;
    } catch (error) {
      const msg =
        error?.message || error?.response?.data?.message || "Login failed.";
      toast.error(msg);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const res = await registerUser(userData);
      setUser(res.data.user);
      toast.success(res.message || "Registered successfully!");
      return res;
    } catch (error) {
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        "Registration failed.";
      toast.error(msg);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser(); // API call if you have one
      toast.success("Logged out successfully!");
    } catch (error) {
      const msg =
        error?.message || error?.response?.data?.message || "Logout failed.";
      toast.error(msg);
      throw error;
    } finally {
      setUser(null);

      // 👇 disconnect socket and clear token
      if (socket.connected) {
        socket.disconnect();
        // ...
      }
      // Optionally clear socket.auth.token (not strictly needed, but for safety)
      if (socket.auth) {
        socket.auth.token = undefined;
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
