import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, refreshUser, getMe } from "@/api/authApi";
import { toast } from "sonner";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- On mount: check if already logged in (cookies available) ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshUser(); // get new access token
        const meRes = await getMe(); // get user info
        setUser(meRes.data || null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await loginUser(credentials);
      setUser(res.data.user);
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

  //   const logout = async () => {
  //     try {
  //       await logoutUser();
  //     } finally {
  //       setUser(null);
  //       toast.success("Logged out successfully!");
  //     }
  //   };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        // logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// --- Custom hook to consume context ---
export const useAuthContext = () => {
  return useContext(AuthContext);
};
