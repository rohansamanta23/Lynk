import { useState } from "react";
import { loginUser, registerUser } from "@/api/authApi";

export default function useAuth() {
  const [user, setUser] = useState(null);

  const register = async (userData) => {
    const res = await registerUser(userData);
    setUser(res.data.user); // ApiResponse { user: ... }
    return res;
  };

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    setUser(res.data.user); // ApiResponse { user: ... }
    return res;
  };
  
//   const logout = async () => {
//     await logoutUser();
//     setUser(null);
//   };

  return {
    user,
    login,
    register,
    // logout,
    isAuthenticated: !!user,
  };
}
